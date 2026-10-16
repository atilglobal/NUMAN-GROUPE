import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { AdminRuleError, createUserWithPassword, hasAnyAdmin } from "../src/admin/users";
import { createUserSchema, fieldErrors } from "../src/admin/validation";
import { withDb } from "./with-db";

/*
 * Creates the first administrator. Values come from ADMIN_NAME, ADMIN_EMAIL
 * and ADMIN_PASSWORD, or are asked interactively (the password is not
 * echoed). Refuses to run once an administrator exists; further users are
 * created from the panel. Nothing entered here is printed or logged.
 */

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return await rl.question(question);
  } finally {
    rl.close();
  }
}

function askHidden(question: string): Promise<string> {
  if (!stdin.isTTY) return ask(question);
  stdout.write(question);
  return new Promise((resolve, reject) => {
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          cleanup();
          stdout.write("\n");
          reject(new Error("İptal edildi."));
          return;
        }
        if (char === "\u0008" || char === "\u007f") value = value.slice(0, -1);
        else value += char;
      }
    };
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
    };
    stdin.on("data", onData);
  });
}

void withDb(async (db) => {
  if (await hasAnyAdmin(db)) {
    throw new Error("Bir yönetici zaten var. Yeni kullanıcıları yönetim panelinden oluşturun.");
  }

  const name = process.env.ADMIN_NAME ?? (await ask("Ad soyad: "));
  const email = process.env.ADMIN_EMAIL ?? (await ask("E-posta: "));
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await askHidden("Parola (en az 12 karakter): ");
    const confirm = await askHidden("Parola (tekrar): ");
    if (password !== confirm) throw new Error("Parolalar eşleşmiyor.");
  }

  const parsed = createUserSchema.safeParse({ name, email, role: "admin", password });
  if (!parsed.success) {
    throw new Error(Object.values(fieldErrors(parsed.error)).join("\n"));
  }

  try {
    await createUserWithPassword(db, parsed.data, null);
  } catch (error) {
    if (error instanceof AdminRuleError) throw new Error(error.message);
    throw error;
  }
  console.log(`Yönetici oluşturuldu: ${parsed.data.email}. Giriş: /admin/giris`);
});
