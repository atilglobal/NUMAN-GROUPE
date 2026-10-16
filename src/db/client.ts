import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";

/** Driver-agnostic handle: the app uses node-postgres, tests use an in-memory PGlite. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as { numanDb?: Database };

export function getDb(): Database {
  if (globalForDb.numanDb) return globalForDb.numanDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and follow docs/database.md.",
    );
  }

  const pool = new Pool({ connectionString, max: Number(process.env.DATABASE_POOL_MAX ?? 5) });
  globalForDb.numanDb = drizzle({ client: pool, schema });
  return globalForDb.numanDb;
}
