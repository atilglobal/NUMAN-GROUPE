import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type StoreEnv = Record<string, string | undefined>;

export function isObjectStorageConfigured(env: StoreEnv = process.env): boolean {
  return Boolean(
    env.MEDIA_S3_BUCKET?.trim() &&
      env.MEDIA_S3_ACCESS_KEY_ID?.trim() &&
      env.MEDIA_S3_SECRET_ACCESS_KEY?.trim(),
  );
}

function client(env: StoreEnv = process.env): S3Client {
  const endpoint = env.MEDIA_S3_ENDPOINT?.trim();
  return new S3Client({
    region: env.MEDIA_S3_REGION?.trim() || "auto",
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId: env.MEDIA_S3_ACCESS_KEY_ID!.trim(),
      secretAccessKey: env.MEDIA_S3_SECRET_ACCESS_KEY!.trim(),
    },
  });
}

function objectKey(storageKey: string): string {
  return storageKey.replace(/^\/+/, "");
}

export async function putStoredObject(storageKey: string, bytes: Buffer, env: StoreEnv = process.env): Promise<void> {
  const bucket = env.MEDIA_S3_BUCKET?.trim();
  if (!bucket) throw new Error("MEDIA_S3_BUCKET is not set.");
  await client(env).send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey(storageKey),
      Body: bytes,
    }),
  );
}

export async function readStoredObject(storageKey: string, env: StoreEnv = process.env): Promise<Buffer | null> {
  const bucket = env.MEDIA_S3_BUCKET?.trim();
  if (!bucket) return null;
  try {
    const result = await client(env).send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey(storageKey),
      }),
    );
    if (!result.Body) return null;
    return Buffer.from(await result.Body.transformToByteArray());
  } catch (error) {
    const name = error && typeof error === "object" && "name" in error ? String(error.name) : "";
    if (name === "NoSuchKey" || name === "NotFound") return null;
    throw error;
  }
}

export async function deleteStoredObject(storageKey: string, env: StoreEnv = process.env): Promise<void> {
  const bucket = env.MEDIA_S3_BUCKET?.trim();
  if (!bucket) return;
  try {
    await client(env).send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectKey(storageKey),
      }),
    );
  } catch {
    /* already gone */
  }
}
