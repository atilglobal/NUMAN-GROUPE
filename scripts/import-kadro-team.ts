import { loadEnvConfig } from "@next/env";
import { applyReviewedMigrations } from "../src/db/migrate";
import { getDb } from "../src/db/client";
import { importKadroTeam } from "../src/content/import-kadro-team";

loadEnvConfig(process.cwd());

function redact(value: string) {
  return value.replace(/postgres(?:ql)?:\/\/[^\s)'"]+/gi, "[redacted]");
}

async function main() {
  console.log("Kadro import: starting");
  const db = getDb();
  await applyReviewedMigrations(db);
  const result = await importKadroTeam(db);
  console.log(
    `Kadro import: created=${result.created} filled=${result.filled} skipped=${result.skipped} mediaCreated=${result.mediaCreated} mediaReused=${result.mediaReused}${
      result.backupPath ? ` backup=${result.backupPath}` : ""
    }`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Kadro import failed.";
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  console.error(redact(`${message}${cause ? ` | ${cause}` : ""}`));
  process.exit(1);
});
