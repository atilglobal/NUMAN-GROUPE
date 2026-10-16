import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDemoContentEnabled } from "@/content/demo-policy";
import {
  deleteStoredObject,
  isObjectStorageConfigured,
  putStoredObject,
  readStoredObject,
} from "./object-store";

/**
 * Bytes live in object storage when MEDIA_S3_* is set, otherwise on
 * MEDIA_STORAGE_DIR (default `.data/media`). Vercel’s disk is ephemeral:
 * uploads without a bucket are refused rather than silently lost.
 * MEDIA_PUBLIC_BASE_URL points at a CDN when one exists; otherwise
 * GET /media/[...key] streams from this store.
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

export async function putObject(storageKey: string, bytes: Buffer): Promise<void> {
  if (!isStoredUploadKey(storageKey) && !isStoredVariantKey(storageKey)) {
    throw new Error("Invalid storage key.");
  }
  if (isObjectStorageConfigured()) {
    await putStoredObject(storageKey, bytes);
    return;
  }
  if (process.env.VERCEL === "1" && process.env.NODE_ENV === "production") {
    throw new Error(
      "Uploads on Vercel are not durable without object storage. Set MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY_ID, MEDIA_S3_SECRET_ACCESS_KEY (and MEDIA_S3_ENDPOINT / MEDIA_S3_REGION for R2 or MinIO).",
    );
  }
  const file = resolveKey(storageKey);
  if (!file) throw new Error("Invalid storage key.");
  await mkdir(/* turbopackIgnore: true */ path.dirname(file), { recursive: true });
  await writeFile(/* turbopackIgnore: true */ file, bytes);
}

export async function readObject(storageKey: string): Promise<Buffer | null> {
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

export async function deleteObject(storageKey: string): Promise<void> {
  if (isObjectStorageConfigured()) {
    await deleteStoredObject(storageKey);
    return;
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
