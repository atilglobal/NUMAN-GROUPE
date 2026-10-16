import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { getTableName, is, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "./client";
import * as schema from "./schema";

/** Fresh in-memory PostgreSQL with the real migrations applied. Test-only. */
export async function createTestDb(): Promise<{ db: Database; close: () => Promise<void> }> {
  const client = new PGlite();
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return { db, close: () => client.close() };
}

const tableNames = (Object.values(schema) as unknown[])
  .flatMap((value) => (is(value, PgTable) ? [`"${getTableName(value)}"`] : []))
  .join(", ");

export async function truncateAll(db: Database): Promise<void> {
  await db.execute(sql.raw(`truncate ${tableNames} restart identity cascade`));
}
