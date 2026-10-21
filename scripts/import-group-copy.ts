import { loadEnvConfig } from "@next/env";
import { getDb } from "../src/db/client";
import { applyReviewedMigrations } from "../src/db/migrate";
import { importGroupCopy } from "../src/content/import-group-copy";

loadEnvConfig(process.cwd());

async function main() {
  const db = getDb();
  await applyReviewedMigrations(db);
  const result = await importGroupCopy(db);
  console.log(
    `Group copy import: created=${result.created} filled=${result.filled} skipped=${result.skipped}${
      result.backupPath ? ` backup=${result.backupPath}` : ""
    }`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Group copy import failed.";
  console.error(message.replace(/postgres(?:ql)?:\/\/[^\s)'"]+/gi, "[redacted]"));
  process.exit(1);
});
