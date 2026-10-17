import { eq, inArray } from "drizzle-orm";
import { AdminRuleError, createUserWithPassword, setUserPassword } from "../src/admin/users";
import { createUserSchema, fieldErrors, passwordSchema } from "../src/admin/validation";
import { normalizePanelLogin } from "../src/auth/login-id";
import { users } from "../src/db/schema";
import { withDb } from "./with-db";

/*
 * Creates or updates one panel login from ADMIN_NAME, ADMIN_EMAIL and
 * ADMIN_PASSWORD. Not a public endpoint; never run from a build. Values are
 * not printed.
 */

void withDb(async (db) => {
  const name = process.env.ADMIN_NAME?.trim() || "Yönetici";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set for this command.");
  }

  const parsed = createUserSchema.safeParse({ name, email, role: "admin", password });
  if (!parsed.success) {
    throw new Error(Object.values(fieldErrors(parsed.error)).join("\n"));
  }

  const login = normalizePanelLogin(parsed.data.email);
  const [existing] = await db
    .select({ id: users.id, email: users.email, role: users.role, disabledAt: users.disabledAt })
    .from(users)
    .where(inArray(users.email, [parsed.data.email, login]));
  if (existing && existing.email !== login) {
    await db.update(users).set({ email: login }).where(eq(users.id, existing.id));
  }

  if (existing) {
    const passwordCheck = passwordSchema.safeParse(password);
    if (!passwordCheck.success) {
      throw new Error(passwordCheck.error.issues[0]?.message ?? "Parola geçersiz.");
    }
    await setUserPassword(db, { id: existing.id }, existing.id, passwordCheck.data);
    console.log(`Mevcut hesap güncellendi: ${parsed.data.email} (rol: ${existing.role}). Giriş: /admin/giris`);
    return;
  }

  try {
    await createUserWithPassword(db, parsed.data, null);
  } catch (error) {
    if (error instanceof AdminRuleError) throw new Error(error.message);
    throw error;
  }
  console.log(`Yönetici oluşturuldu: ${parsed.data.email}. Giriş: /admin/giris`);
});
