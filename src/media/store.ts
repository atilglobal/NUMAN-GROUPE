import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { mediaAssets, mediaAssetTranslations } from "@/db/schema";
import { locales, type Locale } from "@/i18n/config";
import { ADMIN_PAGE_SIZE, clampPage } from "@/lib/pagination";
import { MediaProcessError, inspectImage } from "./process";
import { ALLOWED_IMAGE_TYPES, EXTENSIONS, MAX_UPLOAD_BYTES, sniffImage } from "./sniff";
import { deleteObject, putObject } from "./storage";
import { mediaUrl } from "./url";

export { MAX_UPLOAD_BYTES, ALLOWED_IMAGE_TYPES };

export class MediaUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaUploadError";
  }
}

export type MediaPickerItem = {
  id: string;
  src: string;
  originalFilename: string | null;
  isDemo: boolean;
  width: number | null;
  height: number | null;
  byteSize: number;
  mimeType: string;
  alts: Partial<Record<Locale, string>>;
  captions: Partial<Record<Locale, string>>;
};

function toItem(
  asset: {
    id: string;
    storageKey: string;
    originalFilename: string | null;
    isDemo: boolean;
    width: number | null;
    height: number | null;
    byteSize: number;
    mimeType: string;
  },
  translations: { assetId: string; locale: Locale; alt: string; caption: string | null }[],
): MediaPickerItem {
  const alts: Partial<Record<Locale, string>> = {};
  const captions: Partial<Record<Locale, string>> = {};
  for (const row of translations) {
    if (row.assetId !== asset.id) continue;
    alts[row.locale] = row.alt;
    if (row.caption) captions[row.locale] = row.caption;
  }
  return {
    id: asset.id,
    src: mediaUrl(asset.storageKey),
    originalFilename: asset.originalFilename,
    isDemo: asset.isDemo,
    width: asset.width,
    height: asset.height,
    byteSize: asset.byteSize,
    mimeType: asset.mimeType,
    alts,
    captions,
  };
}

export async function listImagesForPicker(db: Database): Promise<MediaPickerItem[]> {
  const [assets, translations] = await Promise.all([
    db
      .select({
        id: mediaAssets.id,
        storageKey: mediaAssets.storageKey,
        originalFilename: mediaAssets.originalFilename,
        isDemo: mediaAssets.isDemo,
        width: mediaAssets.width,
        height: mediaAssets.height,
        byteSize: mediaAssets.byteSize,
        mimeType: mediaAssets.mimeType,
      })
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt)),
    db.select().from(mediaAssetTranslations),
  ]);

  return assets.map((asset) => toItem(asset, translations));
}

export async function listMediaLibrary(
  db: Database,
  filters: { q?: string; page: number },
): Promise<{ rows: MediaPickerItem[]; total: number; page: number; pageSize: number }> {
  const conditions = [];
  if (filters.q) {
    const matches = await db
      .selectDistinct({ id: mediaAssets.id })
      .from(mediaAssets)
      .leftJoin(mediaAssetTranslations, eq(mediaAssetTranslations.assetId, mediaAssets.id))
      .where(
        or(
          ilike(mediaAssets.originalFilename, `%${filters.q}%`),
          ilike(mediaAssets.storageKey, `%${filters.q}%`),
          ilike(mediaAssetTranslations.alt, `%${filters.q}%`),
          ilike(mediaAssetTranslations.caption, `%${filters.q}%`),
        ),
      );
    const ids = matches.map((row) => row.id);
    if (ids.length === 0) return { rows: [], total: 0, page: 1, pageSize: ADMIN_PAGE_SIZE };
    conditions.push(inArray(mediaAssets.id, ids));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [totalRow] = await db.select({ value: sql<number>`count(*)` }).from(mediaAssets).where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, ADMIN_PAGE_SIZE);
  const assets = await db
    .select({
      id: mediaAssets.id,
      storageKey: mediaAssets.storageKey,
      originalFilename: mediaAssets.originalFilename,
      isDemo: mediaAssets.isDemo,
      width: mediaAssets.width,
      height: mediaAssets.height,
      byteSize: mediaAssets.byteSize,
      mimeType: mediaAssets.mimeType,
    })
    .from(mediaAssets)
    .where(where)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);
  const translations =
    assets.length === 0
      ? []
      : await db
          .select()
          .from(mediaAssetTranslations)
          .where(
            inArray(
              mediaAssetTranslations.assetId,
              assets.map((asset) => asset.id),
            ),
          );
  return {
    rows: assets.map((asset) => toItem(asset, translations)),
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  };
}

export async function getMediaForEditor(db: Database, id: string): Promise<(MediaPickerItem & { storageKey: string }) | null> {
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
  if (!asset) return null;
  const translations = await db.select().from(mediaAssetTranslations).where(eq(mediaAssetTranslations.assetId, id));
  return { ...toItem(asset, translations), storageKey: asset.storageKey };
}

export async function requireImageIds(db: Database, ids: string[]): Promise<void> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return;
  const rows = await db.select({ id: mediaAssets.id }).from(mediaAssets).where(inArray(mediaAssets.id, unique));
  if (rows.length !== unique.length) throw new MediaUploadError("Seçilen görsellerden biri bulunamadı.");
}

export async function updateMediaCaptions(
  db: Database,
  items: { id: string; captions: Partial<Record<Locale, string>> }[],
): Promise<void> {
  for (const item of items) {
    for (const locale of locales) {
      const caption = item.captions[locale]?.trim() || null;
      await db
        .update(mediaAssetTranslations)
        .set({ caption })
        .where(and(eq(mediaAssetTranslations.assetId, item.id), eq(mediaAssetTranslations.locale, locale)));
    }
  }
}

export async function saveMediaText(
  db: Database,
  id: string,
  input: { alts: Partial<Record<Locale, string>>; captions: Partial<Record<Locale, string>> },
): Promise<void> {
  const alts = locales
    .map((locale) => [locale, input.alts[locale]?.trim() ?? ""] as const)
    .filter(([, alt]) => alt.length > 0);
  if (alts.length === 0) throw new MediaUploadError("En az bir dilde alternatif metin girin.");
  await db.transaction(async (tx) => {
    await tx.delete(mediaAssetTranslations).where(eq(mediaAssetTranslations.assetId, id));
    await tx.insert(mediaAssetTranslations).values(
      alts.map(([locale, alt]) => ({
        assetId: id,
        locale,
        alt,
        caption: input.captions[locale]?.trim() || null,
      })),
    );
  });
}

export async function saveUploadedImage(
  db: Database,
  input: {
    file: File;
    alts: Partial<Record<Locale, string>>;
    captions?: Partial<Record<Locale, string>>;
    actorUserId: string | null;
  },
): Promise<string> {
  if (input.file.size <= 0) throw new MediaUploadError("Dosya boş.");
  if (input.file.size > MAX_UPLOAD_BYTES) throw new MediaUploadError("Dosya en fazla 6 MB olabilir.");

  const declared = input.file.type.toLowerCase();
  if (declared.includes("svg") || declared.includes("xml")) {
    throw new MediaUploadError("SVG yüklenemez.");
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const sniffed = sniffImage(buffer);
  if (!sniffed || !ALLOWED_IMAGE_TYPES.has(sniffed.mime)) {
    throw new MediaUploadError("Yalnızca JPEG, PNG, WebP veya GIF yüklenebilir. Uzantıya güvenilmez.");
  }
  let width = sniffed.width;
  let height = sniffed.height;
  if (sniffed.mime !== "image/gif") {
    try {
      const inspected = await inspectImage(buffer);
      width = inspected.width;
      height = inspected.height;
    } catch (error) {
      if (error instanceof MediaProcessError) throw new MediaUploadError(error.message);
    }
  }

  const alts = Object.fromEntries(
    locales
      .map((locale) => [locale, input.alts[locale]?.trim() ?? ""] as const)
      .filter(([, alt]) => alt.length > 0),
  ) as Partial<Record<Locale, string>>;
  if (Object.keys(alts).length === 0) {
    throw new MediaUploadError("En az bir dilde alternatif metin girin.");
  }

  const id = crypto.randomUUID();
  const ext = EXTENSIONS[sniffed.mime];
  const storageKey = `uploads/${id}.${ext}`;
  try {
    await putObject(storageKey, buffer);
  } catch (error) {
    throw new MediaUploadError(
      error instanceof Error
        ? error.message
        : "Görsel kaydedilemedi. Kalıcı depolama yapılandırılmamış olabilir.",
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(mediaAssets).values({
        id,
        storageKey,
        mimeType: sniffed.mime,
        byteSize: buffer.length,
        width,
        height,
        originalFilename: input.file.name.slice(0, 200),
        createdById: input.actorUserId,
      });
      await tx.insert(mediaAssetTranslations).values(
        (Object.entries(alts) as [Locale, string][]).map(([locale, alt]) => ({
          assetId: id,
          locale,
          alt,
          caption: input.captions?.[locale]?.trim() || null,
        })),
      );
    });
  } catch (error) {
    await deleteObject(storageKey);
    throw error;
  }
  return id;
}

export async function deleteMediaAsset(db: Database, id: string): Promise<void> {
  const [row] = await db
    .select({ storageKey: mediaAssets.storageKey })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id));
  if (!row) throw new MediaUploadError("Kayıt bulunamadı.");
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  await deleteObject(row.storageKey);
}

export async function getAsset(db: Database, id: string) {
  const [row] = await db.select({ id: mediaAssets.id }).from(mediaAssets).where(eq(mediaAssets.id, id));
  return row ?? null;
}
