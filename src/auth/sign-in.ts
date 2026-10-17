import { APIError } from "better-auth/api";
import { writeAudit } from "../admin/audit";
import type { Database } from "../db/client";
import type { Auth } from "./config";
import { normalizePanelLogin } from "./login-id";
import { clearLoginFailures, isLoginBlocked, recordLoginFailure } from "./rate-limit";

/** Same text for unknown address, wrong password and disabled account. */
export const SIGN_IN_ERROR = "E-posta adresi veya parola hatalı.";
export const SIGN_IN_THROTTLED =
  "Çok sayıda başarısız deneme yapıldı. Lütfen 15 dakika sonra yeniden deneyin.";

export type SignInOutcome = { ok: true; userId: string } | { ok: false; error: string };

/**
 * Throttled e-mail/password sign-in. The address and password are never
 * written to the audit log; failures are recorded without an identity.
 */
export async function signInWithPassword(
  auth: Auth,
  db: Database,
  input: { email: string; password: string; ip: string | null; headers: Headers },
  now = new Date(),
): Promise<SignInOutcome> {
  const email = normalizePanelLogin(input.email);
  const keys = { email, ip: input.ip };

  if (await isLoginBlocked(db, keys, now)) {
    await writeAudit(db, {
      actorUserId: null,
      action: "auth.sign_in_throttled",
      entityType: "auth",
      entityId: "-",
      ip: input.ip,
    });
    return { ok: false, error: SIGN_IN_THROTTLED };
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password: input.password },
      headers: input.headers,
    });
    await clearLoginFailures(db, email);
    await writeAudit(db, {
      actorUserId: result.user.id,
      action: "auth.sign_in",
      entityType: "user",
      entityId: result.user.id,
      ip: input.ip,
    });
    return { ok: true, userId: result.user.id };
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    await recordLoginFailure(db, keys, now);
    await writeAudit(db, {
      actorUserId: null,
      action: "auth.sign_in_failed",
      entityType: "auth",
      entityId: "-",
      ip: input.ip,
    });
    return { ok: false, error: SIGN_IN_ERROR };
  }
}
