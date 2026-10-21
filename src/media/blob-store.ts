import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { mediaBlobs } from "@/db/schema";

export async function putMediaBlob(db: Database, storageKey: string, bytes: Buffer): Promise<void> {
  await db
    .insert(mediaBlobs)
    .values({ storageKey, bytes, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: mediaBlobs.storageKey,
      set: { bytes, updatedAt: new Date() },
    });
}

export async function readMediaBlob(db: Database, storageKey: string): Promise<Buffer | null> {
  const [row] = await db
    .select({ bytes: mediaBlobs.bytes })
    .from(mediaBlobs)
    .where(eq(mediaBlobs.storageKey, storageKey));
  if (!row?.bytes) return null;
  return Buffer.isBuffer(row.bytes) ? row.bytes : Buffer.from(row.bytes);
}

export async function deleteMediaBlob(db: Database, storageKey: string): Promise<void> {
  await db.delete(mediaBlobs).where(eq(mediaBlobs.storageKey, storageKey));
}
