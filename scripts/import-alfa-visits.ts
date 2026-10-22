import { loadEnvConfig } from "@next/env";
import { getDb } from "../src/db/client";
import { importAlfaVisits } from "../src/content/import-alfa-visits";

loadEnvConfig(process.cwd());

function redact(value: string) {
  return value.replace(/postgres(?:ql)?:\/\/[^\s)'"]+/gi, "[redacted]");
}

async function main() {
  console.log("Alfa visits import: starting");
  const db = getDb();
  const result = await importAlfaVisits(db);
  console.log(
    `Alfa visits import: mediaCreated=${result.mediaCreated} mediaReused=${result.mediaReused} visitsCreated=${result.visitsCreated} visitsSkipped=${result.visitsSkipped} hq=${result.hqImported} bytes=${result.verifiedBytes}`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Alfa visits import failed.";
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  console.error(redact(`${message}${cause ? ` | ${cause}` : ""}`));
  process.exit(1);
});
