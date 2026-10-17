import { loadEnvConfig } from "@next/env";
import { sql } from "drizzle-orm";
import { getDb } from "../src/db/client";
import { applyReviewedMigrations } from "../src/db/migrate";
import { SETUP_ADVISORY_KEY, SETUP_ADVISORY_NS, isProductionMigrateEnv } from "../src/setup/policy";

loadEnvConfig(process.cwd());

async function main() {
  if (!isProductionMigrateEnv(process.env)) {
    console.log("Skipping reviewed migrations (not Vercel Production).");
    return;
  }

  const db = getDb();
  await db.execute(sql`select pg_advisory_lock(${SETUP_ADVISORY_NS}, ${SETUP_ADVISORY_KEY})`);
  try {
    await applyReviewedMigrations(db);
    console.log("Reviewed migrations applied.");
  } finally {
    await db.execute(sql`select pg_advisory_unlock(${SETUP_ADVISORY_NS}, ${SETUP_ADVISORY_KEY})`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Migration failed.";
  console.error(message.replace(/postgres(?:ql)?:\/\/[^\s)'"]+/gi, "[redacted]"));
  process.exit(1);
});
