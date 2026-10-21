import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDemoContentEnabled } from "@/content/demo-policy";
import { tryGetDb, type Database } from "@/db/client";
import { deleteMediaBlob, putMediaBlob, readMediaBlob } from "./blob-store";
import {
  deleteStoredObject,
  isObjectStorageConfigured,
  putStoredObject,
  readStoredObject,
} from "./object-store";

/**
 * Bytes live in S3 when MEDIA_S3_* is set. Otherwise they are stored in
 * Postgres (`media_blobs`) so Vercel deploys do not wipe uploads. Local disk
 * is only a leftover fallback for files written before this store existed.
 */

const UPLOAD_PREFIX = "uploads/";
const KEY_PATTERN = /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i;
const VARIANT_PATTERN =
  /^variants\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[a-zA-Z]+\/\d+\/\d+x\d+\.(jpg|png|webp)$/i;
const DEMO_KEY = /^demo\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|gif)$/i;

export function isStoredUploadKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

export function isStoredVariantKey(key: string): boolean {
  return VARIANT_PATTERN.test(key);
}

export function isPublicMediaKey(key: string, env: Parameters<typeof isDemoContentEnabled>[0] = process.env): boolean {
  if (isStoredUploadKey(key) || isStoredVariantKey(key)) return true;
  return DEMO_KEY.test(key) && isDemoContentEnabled(env);
}

export function storageRoot(): string {
  const configured = process.env.MEDIA_STORAGE_DIR?.trim();
  if (configured) return configured;
  return path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "media");
}

function resolveKey(storageKey: string): string | null {
  const normalized = storageKey.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!isStoredUploadKey(normalized) && !isStoredVariantKey(normalized)) return null;
  const absolute = path.resolve(/* turbopackIgnore: true */ storageRoot(), normalized);
  const root = path.resolve(/* turbopackIgnore: true */ storageRoot());
  if (!absolute.startsWith(root + path.sep) && absolute !== root) return null;
  return absolute;
}

export async function putObject(storageKey: string, bytes: Buffer, db: Database | null = tryGetDb()): Promise<void> {
  if (!isStoredUploadKey(storageKey) && !isStoredVariantKey(storageKey)) {
    throw new Error("Invalid storage key.");
  }
  if (isObjectStorageConfigured()) {
    await putStoredObject(storageKey, bytes);
    return;
  }
  if (db) {
    await putMediaBlob(db, storageKey, bytes);
    return;
  }
  if (process.env.VERCEL === "1") {
    throw new Error("Veritabanı bağlantısı yok; görsel kaydedilemedi.");
  }
  const file = resolveKey(storageKey);
  if (!file) throw new Error("Invalid storage key.");
  await mkdir(/* turbopackIgnore: true */ path.dirname(file), { recursive: true });
  await writeFile(/* turbopackIgnore: true */ file, bytes);
}

export async function readObject(storageKey: string, db: Database | null = tryGetDb()): Promise<Buffer | null> {
  if (DEMO_KEY.test(storageKey)) {
    if (!isDemoContentEnabled()) return null;
    try {
      return await readFile(
        /* turbopackIgnore: true */ path.join(process.cwd(), "content", storageKey),
      );
    } catch {
      return null;
    }
  }
  if (isObjectStorageConfigured()) {
    return readStoredObject(storageKey);
  }
  if (db) {
    const fromDb = await readMediaBlob(db, storageKey);
    if (fromDb) return fromDb;
  }
  const file = resolveKey(storageKey);
  if (!file) return null;
  try {
    return await readFile(/* turbopackIgnore: true */ file);
  } catch {
    if (storageKey.startsWith(UPLOAD_PREFIX)) {
      try {
        return await readFile(
          /* turbopackIgnore: true */ path.join(process.cwd(), "public", "media", storageKey),
        );
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function deleteObject(storageKey: string, db: Database | null = tryGetDb()): Promise<void> {
  if (isObjectStorageConfigured()) {
    await deleteStoredObject(storageKey);
    return;
  }
  if (db) {
    try {
      await deleteMediaBlob(db, storageKey);
    } catch {
      /* table may not exist yet during partial setup */
    }
  }
  const file = resolveKey(storageKey);
  if (!file) return;
  try {
    await unlink(/* turbopackIgnore: true */ file);
  } catch {
    /* already gone */
  }
  try {
    await unlink(/* turbopackIgnore: true */ path.join(process.cwd(), "public", "media", storageKey));
  } catch {
    /* legacy public copy, optional */
  }
}
