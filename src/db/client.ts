import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";
import { missingDatabaseUrlMessage, resolveDatabaseUrl } from "./url";

/** Driver-agnostic handle: the app uses node-postgres, tests use an in-memory PGlite. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as { numanDb?: Database };

export function getDb(): Database {
  if (globalForDb.numanDb) return globalForDb.numanDb;

  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    throw new Error(missingDatabaseUrlMessage());
  }

  const poolMax = Number(process.env.DATABASE_POOL_MAX ?? (process.env.VERCEL ? 1 : 5));
  const pool = new Pool({ connectionString, max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 5 });
  globalForDb.numanDb = drizzle({ client: pool, schema });
  return globalForDb.numanDb;
}
