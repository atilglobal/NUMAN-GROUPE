import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { Database } from "../src/db/client";
import { postgresPoolConfig } from "../src/db/pool";
import * as schema from "../src/db/schema";
import { resolveDatabaseUrl } from "../src/db/url";

loadEnvConfig(process.cwd());

function redactSecrets(message: string): string {
  let next = message;
  const secrets = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_PRISMA_URL,
    process.env.BETTER_AUTH_SECRET,
    process.env.RESEND_API_KEY,
    process.env.ADMIN_PASSWORD,
    process.env.MEDIA_S3_SECRET_ACCESS_KEY,
    process.env.MEDIA_S3_ACCESS_KEY_ID,
  ];
  for (const value of secrets) {
    if (value && value.length > 7) next = next.split(value).join("[redacted]");
  }
  return next;
}

/** Runs a one-off task against the resolved Postgres URL and always closes the pool. */
export async function withDb(task: (db: Database) => Promise<void>): Promise<void> {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    console.error("DATABASE_URL is not set (POSTGRES_URL is also accepted). See .env.example and docs/database.md.");
    process.exit(1);
  }

  const pool = new Pool({ ...postgresPoolConfig(connectionString), max: 1 });
  try {
    await task(drizzle({ client: pool, schema }));
  } catch (error) {
    console.error(redactSecrets(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
