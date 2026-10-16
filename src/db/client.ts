import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { postgresPoolConfig } from "./pool";
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

  const pool = new Pool(postgresPoolConfig(connectionString));
  globalForDb.numanDb = drizzle({ client: pool, schema });
  return globalForDb.numanDb;
}
