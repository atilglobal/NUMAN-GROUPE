import { signInWithPassword } from "../src/auth/sign-in";
import { createAuth } from "../src/auth/config";
import { withDb } from "./with-db";

void withDb(async (db) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set.");
  const auth = createAuth(db);
  const result = await signInWithPassword(auth, db, {
    email,
    password,
    ip: null,
    headers: new Headers(),
  });
  if (!result.ok) throw new Error("Giriş doğrulanamadı.");
  console.log("Giriş doğrulandı.");
});
