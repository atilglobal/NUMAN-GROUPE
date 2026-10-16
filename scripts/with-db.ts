import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { Database } from "../src/db/client";
import * as schema from "../src/db/schema";

loadEnvConfig(process.cwd());

function redactSecrets(message: string): string {
  let next = message;
  for (const value of [process.env.DATABASE_URL, process.env.BETTER_AUTH_SECRET, process.env.RESEND_API_KEY]) {
    if (value && value.length > 7) next = next.split(value).join("[redacted]");
  }
  return next;
}

/** Runs a one-off task against DATABASE_URL and always closes the pool. */
export async function withDb(task: (db: Database) => Promise<void>): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. See .env.example and docs/database.md.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString, max: 1 });
  try {
    await task(drizzle({ client: pool, schema }));
  } catch (error) {
    console.error(redactSecrets(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
