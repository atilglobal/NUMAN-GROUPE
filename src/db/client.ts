import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";
import { missingDatabaseUrlMessage, resolveDatabaseUrl } from "./url";

/** Driver-agnostic handle: the app uses node-postgres, tests use an in-memory PGlite. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as { numanDb?: Database };

export function isDatabaseConfigured(): boolean {
  return Boolean(resolveDatabaseUrl());
}

/** Public prerender/build may run before Postgres env is attached. */
export function tryGetDb(): Database | null {
  return isDatabaseConfigured() ? getDb() : null;
}

export function getDb(): Database {
  if (globalForDb.numanDb) return globalForDb.numanDb;

  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    throw new Error(missingDatabaseUrlMessage());
  }

  const poolMax = Number(process.env.DATABASE_POOL_MAX ?? (process.env.VERCEL ? 1 : 5));
  const hosted =
    Boolean(process.env.VERCEL) || /neon\.tech|supabase\.co|pooler\.supabase|vercel-storage/i.test(connectionString);
  const pool = new Pool({
    connectionString,
    max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 5,
    ssl: hosted ? { rejectUnauthorized: false } : undefined,
  });
  globalForDb.numanDb = drizzle({ client: pool, schema });
  return globalForDb.numanDb;
}
