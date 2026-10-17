import { eq, sql } from "drizzle-orm";
import { AdminRuleError, hasAnyAdmin, insertUserWithPassword } from "@/admin/users";
import { createUserSchema, fieldErrors, passwordSchema, usernameSchema } from "@/admin/validation";
import { normalizePanelLogin } from "@/auth/login-id";
import { recordLoginFailure, isLoginBlocked } from "@/auth/rate-limit";
import type { Database } from "@/db/client";
import { applyReviewedMigrations } from "@/db/migrate";
import { setupState, users } from "@/db/schema";
import { seedBase } from "@/db/seed/run";
import {
  SETUP_ADVISORY_KEY,
  SETUP_ADVISORY_NS,
  SETUP_BLOCK_MS,
  SETUP_MAX_FAILURES,
  SETUP_WINDOW_MS,
  isSetupRuntimeAllowed,
  setupKeyFromEnv,
} from "./policy";
import { redactSetupError, setupKeysMatch } from "./secrets";

export type SetupStatus =
  | { kind: "closed" }
  | { kind: "locked" }
  | { kind: "admin_exists" }
  | { kind: "open" };

export type SetupInput = {
  setupKey: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SetupResult =
  | { ok: true; loginEmail: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const GENERIC_DENIED = "Kurulum kapalı.";
const GENERIC_KEY = "Kurulum doğrulanamadı.";
const THROTTLED = "Çok sayıda başarısız deneme. Lütfen 15 dakika sonra yeniden deneyin.";
const ADMIN_EXISTS = "Bu veritabanında zaten bir yönetici var. Kurulum yeni hesap eklemez ve parolaları değiştirmez. Hesap kurtarma ayrı yapılır.";

export async function readSetupStatus(db: Database): Promise<SetupStatus> {
  try {
    const [row] = await db.select({ completedAt: setupState.completedAt }).from(setupState).where(eq(setupState.id, 1));
    if (row?.completedAt) return { kind: "locked" };
    if (await hasAnyAdmin(db)) return { kind: "admin_exists" };
    return { kind: "open" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/setup_state|does not exist|undefined_table/i.test(message)) return { kind: "open" };
    return { kind: "closed" };
  }
}

export async function publicSetupView(
  db: Database | null,
  env: Record<string, string | undefined> = process.env,
): Promise<SetupStatus> {
  if (!isSetupRuntimeAllowed(env) || !db) return { kind: "closed" };
  return readSetupStatus(db);
}

async function withAdvisoryLock<T>(db: Database, task: () => Promise<T>): Promise<T> {
  await db.execute(sql`select pg_advisory_lock(${SETUP_ADVISORY_NS}, ${SETUP_ADVISORY_KEY})`);
  try {
    return await task();
  } finally {
    await db.execute(sql`select pg_advisory_unlock(${SETUP_ADVISORY_NS}, ${SETUP_ADVISORY_KEY})`);
  }
}

async function recordSetupFailure(db: Database, ip: string | null, now = new Date()): Promise<void> {
  try {
    await recordLoginFailure(db, { email: "setup", ip }, now);
  } catch {
    /* rate table may be missing before migrate */
  }
}

export async function completeSetup(
  db: Database,
  input: SetupInput,
  options: { ip: string | null; env?: Record<string, string | undefined>; skipMigrate?: boolean },
): Promise<SetupResult> {
  const env = options.env ?? process.env;
  if (!isSetupRuntimeAllowed(env)) return { ok: false, message: GENERIC_DENIED };

  const expected = setupKeyFromEnv(env);
  if (!expected) return { ok: false, message: GENERIC_DENIED };

  try {
    if (await isLoginBlocked(db, { email: "setup", ip: options.ip })) {
      return { ok: false, message: THROTTLED };
    }
  } catch {
    /* ignore until schema exists */
  }

  if (!setupKeysMatch(input.setupKey, expected)) {
    await recordSetupFailure(db, options.ip);
    return { ok: false, message: GENERIC_KEY };
  }

  return withAdvisoryLock(db, async () => {
    if (!options.skipMigrate) {
      try {
        await applyReviewedMigrations(db);
      } catch (error) {
        return {
          ok: false as const,
          message: `Veritabanı hazırlığı tamamlanamadı. ${redactSetupError(error instanceof Error ? error.message : "Bilinmeyen hata", env)}`,
        };
      }
    }

    try {
      await seedBase(db);
    } catch (error) {
      return {
        ok: false as const,
        message: `Başlangıç kayıtları yazılamadı. ${redactSetupError(error instanceof Error ? error.message : "Bilinmeyen hata", env)}`,
      };
    }

    const status = await readSetupStatus(db);
    if (status.kind === "locked" || status.kind === "admin_exists") {
      return { ok: false, message: ADMIN_EXISTS };
    }

    const username = usernameSchema.safeParse(input.username);
    const parsed = createUserSchema.safeParse({
      name: username.success ? username.data : input.username,
      email: normalizePanelLogin(username.success ? username.data : input.username.trim().toLowerCase()),
      role: "admin",
      password: input.password,
    });
    const passwordOk = passwordSchema.safeParse(input.password);
    const fieldErr: Record<string, string> = {};
    if (!username.success) fieldErr.username = username.error.issues[0]?.message ?? "Kullanıcı adı geçersiz.";
    if (!parsed.success) Object.assign(fieldErr, fieldErrors(parsed.error));
    if (input.password !== input.confirmPassword) fieldErr.confirmPassword = "Parolalar eşleşmiyor.";
    if (!passwordOk.success) fieldErr.password = passwordOk.error.issues[0]?.message ?? "Parola geçersiz.";
    const emailCheck = createUserSchema.safeParse({
      name: input.username,
      email: input.email,
      role: "admin",
      password: input.password,
    });
    if (!emailCheck.success) {
      const errors = fieldErrors(emailCheck.error);
      if (errors.email) fieldErr.email = errors.email;
    }
    if (Object.keys(fieldErr).length) return { ok: false, message: "Formu kontrol edin.", fieldErrors: fieldErr };

    const loginEmail = parsed.data!.email;
    const [emailTaken] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email.trim().toLowerCase()));
    if (emailTaken && input.email.trim().toLowerCase() !== loginEmail) {
      return { ok: false, message: "Bu e-posta adresi zaten kayıtlı." };
    }

    try {
      const id = await db.transaction(async (tx) => {
        if (await hasAnyAdmin(tx)) {
          throw new AdminRuleError(ADMIN_EXISTS);
        }
        const userId = await insertUserWithPassword(
          tx,
          { name: parsed.data!.name, email: loginEmail, role: "admin", password: parsed.data!.password },
          null,
        );
        await tx
          .insert(setupState)
          .values({ id: 1, completedAt: new Date(), completedByUserId: userId })
          .onConflictDoUpdate({
            target: setupState.id,
            set: { completedAt: new Date(), completedByUserId: userId },
          });
        return userId;
      });
      if (!id) return { ok: false, message: GENERIC_DENIED };
    } catch (error) {
      if (error instanceof AdminRuleError) return { ok: false, message: error.message };
      return {
        ok: false,
        message: redactSetupError(error instanceof Error ? error.message : GENERIC_DENIED, env),
      };
    }

    return { ok: true, loginEmail };
  });
}

export { ADMIN_EXISTS, GENERIC_DENIED, GENERIC_KEY, SETUP_BLOCK_MS, SETUP_MAX_FAILURES, SETUP_WINDOW_MS };
