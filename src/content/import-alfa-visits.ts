import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  mediaAssets,
  mediaAssetTranslations,
  officialVisitGallery,
  officialVisitParticipants,
  officialVisitParticipantTranslations,
  officialVisits,
  officialVisitTranslations,
} from "@/db/schema";
import { locales } from "@/i18n/config";
import { putObject, readObject } from "@/media/storage";
import { inspectImage } from "@/media/process";
import { sniffImage } from "@/media/sniff";
import {
  ALFA_EXPECTED_PHOTO_FILES,
  ALFA_HQ_PHOTO,
  ALFA_VISITS,
  type AlfaPhoto,
  type AlfaVisit,
} from "./alfa-visits";

export const ALFA_MEDIA_DIR = path.join(process.cwd(), "docs", "backups", "alfa-visits", "unzipped", "word", "media");
const FILENAME_PREFIX = "alfa-visits/";

function empty(value: string | null | undefined) {
  return !value?.trim();
}

function clip(value: string, max: number) {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max).trim();
}

function originalName(file: string) {
  return `${FILENAME_PREFIX}${file}`;
}

export type AlfaImportResult = {
  mediaCreated: number;
  mediaReused: number;
  visitsCreated: number;
  visitsSkipped: number;
  translationsCreated: number;
  translationsSkipped: number;
  hqImported: boolean;
  verifiedBytes: number;
  missingFiles: string[];
};

async function upsertPhoto(db: Database, photo: AlfaPhoto, bytes: Buffer): Promise<{ id: string; created: boolean }> {
  const filename = originalName(photo.file);
  const [existing] = await db
    .select({ id: mediaAssets.id, storageKey: mediaAssets.storageKey, byteSize: mediaAssets.byteSize })
    .from(mediaAssets)
    .where(eq(mediaAssets.originalFilename, filename));
  if (existing) {
    const stored = await readObject(existing.storageKey, db);
    if (!stored || stored.length !== existing.byteSize) {
      throw new Error(`Medya kaydı var ama dosya okunamadı: ${filename}`);
    }
    return { id: existing.id, created: false };
  }

  const sniffed = sniffImage(bytes);
  if (!sniffed) throw new Error(`Geçersiz görsel: ${photo.file}`);
  const inspected = await inspectImage(bytes);
  const id = crypto.randomUUID();
  const storageKey = `uploads/${id}.jpg`;
  await putObject(storageKey, bytes, db);
  const stored = await readObject(storageKey, db);
  if (!stored || stored.length !== bytes.length) {
    throw new Error(`Orijinal baytlar yazılamadı: ${photo.file}`);
  }

  await db.insert(mediaAssets).values({
    id,
    storageKey,
    mimeType: sniffed.mime,
    byteSize: bytes.length,
    width: inspected.width,
    height: inspected.height,
    originalFilename: filename,
    isDemo: false,
  });
  await db.insert(mediaAssetTranslations).values(
    locales.map((locale) => ({
      assetId: id,
      locale,
      alt: clip(photo.alt[locale], 200),
      caption: clip(photo.caption[locale], 240),
    })),
  );
  return { id, created: true };
}

async function loadBytes(mediaDir: string, file: string): Promise<Buffer> {
  return readFile(path.join(mediaDir, file));
}

async function createVisitRecord(
  db: Database,
  visit: AlfaVisit,
  assetIds: string[],
): Promise<"created" | "skipped"> {
  const [existing] = await db
    .select({ id: officialVisitTranslations.visitId })
    .from(officialVisitTranslations)
    .where(and(eq(officialVisitTranslations.locale, "fr"), eq(officialVisitTranslations.slug, visit.slug.fr)));
  if (existing) return "skipped";

  const [row] = await db
    .insert(officialVisits)
    .values({
      visitedOn: null,
      countryCode: visit.countryCode,
      coverAssetId: assetIds[0] ?? null,
      isFeatured: false,
      isDemo: false,
    })
    .returning({ id: officialVisits.id });

  const now = new Date();
  for (const locale of locales) {
    const published = visit.published;
    await db.insert(officialVisitTranslations).values({
      visitId: row.id,
      locale,
      slug: visit.slug[locale],
      title: visit.title[locale],
      hostInstitution: empty(visit.host[locale]) ? null : visit.host[locale],
      location: empty(visit.city[locale]) ? null : visit.city[locale],
      summary: visit.summary[locale],
      body: visit.body[locale],
      seoTitle: clip(visit.seoTitle[locale], 70),
      seoDescription: clip(visit.seoDescription[locale], 200),
      status: published ? "published" : "draft",
      publishedAt: published ? now : null,
    });
  }

  if (assetIds.length > 0) {
    await db.insert(officialVisitGallery).values(
      assetIds.map((assetId, sortOrder) => ({ visitId: row.id, assetId, sortOrder })),
    );
  }

  for (const [index, person] of visit.participants.entries()) {
    const [participant] = await db
      .insert(officialVisitParticipants)
      .values({ visitId: row.id, fullName: person.fullName, sortOrder: index })
      .returning({ id: officialVisitParticipants.id });
    const roles = locales
      .map((locale) => ({ locale, roleTitle: person.role[locale]?.trim() ?? "" }))
      .filter((row) => row.roleTitle.length > 0);
    if (roles.length > 0) {
      await db.insert(officialVisitParticipantTranslations).values(
        roles.map((role) => ({ participantId: participant.id, locale: role.locale, roleTitle: clip(role.roleTitle, 160) })),
      );
    }
  }

  return "created";
}

export async function importAlfaVisits(
  db: Database,
  options: { mediaDir?: string } = {},
): Promise<AlfaImportResult> {
  const mediaDir = options.mediaDir ?? ALFA_MEDIA_DIR;
  const missingFiles: string[] = [];
  const buffers = new Map<string, Buffer>();

  for (const file of ALFA_EXPECTED_PHOTO_FILES) {
    try {
      buffers.set(file, await loadBytes(mediaDir, file));
    } catch {
      missingFiles.push(file);
    }
  }
  if (missingFiles.length > 0) {
    throw new Error(`Eksik kaynak fotoğraflar: ${missingFiles.join(", ")}`);
  }

  const result: AlfaImportResult = {
    mediaCreated: 0,
    mediaReused: 0,
    visitsCreated: 0,
    visitsSkipped: 0,
    translationsCreated: 0,
    translationsSkipped: 0,
    hqImported: false,
    verifiedBytes: 0,
    missingFiles,
  };

  const hq = await upsertPhoto(db, ALFA_HQ_PHOTO, buffers.get(ALFA_HQ_PHOTO.file)!);
  result.hqImported = true;
  if (hq.created) result.mediaCreated += 1;
  else result.mediaReused += 1;
  result.verifiedBytes += buffers.get(ALFA_HQ_PHOTO.file)!.length;

  const visitsInInsertOrder = [...ALFA_VISITS].reverse();
  for (const visit of visitsInInsertOrder) {
    const assetIds: string[] = [];
    for (const photo of visit.photos) {
      const bytes = buffers.get(photo.file);
      if (!bytes) throw new Error(`Fotoğraf okunamadı: ${photo.file}`);
      const asset = await upsertPhoto(db, photo, bytes);
      assetIds.push(asset.id);
      if (asset.created) result.mediaCreated += 1;
      else result.mediaReused += 1;
      result.verifiedBytes += bytes.length;
    }

    const outcome = await createVisitRecord(db, visit, assetIds);
    if (outcome === "created") {
      result.visitsCreated += 1;
      result.translationsCreated += locales.length;
    } else {
      result.visitsSkipped += 1;
      result.translationsSkipped += locales.length;
    }
  }

  return result;
}

export function alfaTransferList(): {
  headquarters: { file: string; sourceCaption: string; classification: string };
  visits: {
    key: string;
    published: boolean;
    title: string;
    countryCode: string | null;
    city: string;
    host: string;
    files: string[];
    sourceCaptions: string[];
    notes: string;
  }[];
  ignoredText: string;
} {
  return {
    headquarters: {
      file: ALFA_HQ_PHOTO.file,
      sourceCaption: ALFA_HQ_PHOTO.sourceCaption,
      classification: "Kurumsal medya — resmî ziyaret değil",
    },
    visits: ALFA_VISITS.map((visit) => ({
      key: visit.key,
      published: visit.published,
      title: visit.title.fr,
      countryCode: visit.countryCode,
      city: visit.city.fr,
      host: visit.host.fr,
      files: visit.photos.map((photo) => photo.file),
      sourceCaptions: visit.photos.map((photo) => photo.sourceCaption),
      notes: visit.notes,
    })),
    ignoredText: "Légende parasite « q » après image40.",
  };
}
