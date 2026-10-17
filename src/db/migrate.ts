import path from "node:path";
import { migrate as migrateNode } from "drizzle-orm/node-postgres/migrator";
import type { Database } from "./client";

export function drizzleFolder(): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "drizzle");
}

/** Applies reviewed SQL in drizzle/. Does not generate files or drop data. */
export async function applyReviewedMigrations(db: Database): Promise<void> {
  await migrateNode(db as Parameters<typeof migrateNode>[0], { migrationsFolder: drizzleFolder() });
}
