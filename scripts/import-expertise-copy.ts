import { loadEnvConfig } from "@next/env";
import { applyReviewedMigrations } from "../src/db/migrate";
import { getDb } from "../src/db/client";
import { importExpertiseCopy } from "../src/content/import-expertise-copy";

loadEnvConfig(process.cwd());

function redact(value: string) {
  return value.replace(/postgres(?:ql)?:\/\/[^\s)'"]+/gi, "[redacted]");
}

async function main() {
  console.log("Expertise copy import: starting");
  const db = getDb();
  await applyReviewedMigrations(db);
  const result = await importExpertiseCopy(db);
  console.log(
    `Expertise copy import: filled=${result.filled} skipped=${result.skipped} altsFilled=${result.altsFilled} publishedTouched=${result.publishedTouched}${
      result.backupPath ? ` backup=${result.backupPath}` : ""
    }`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Expertise copy import failed.";
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  console.error(redact(`${message}${cause ? ` | ${cause}` : ""}`));
  process.exit(1);
});
