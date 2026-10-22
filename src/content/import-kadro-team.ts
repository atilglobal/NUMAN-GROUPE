import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { mediaAssetTranslations, mediaAssets, teamMembers, teamMemberTranslations } from "@/db/schema";
import { locales } from "@/i18n/config";
import { inspectImage } from "@/media/process";
import { sniffImage, EXTENSIONS } from "@/media/sniff";
import { putObject, readObject } from "@/media/storage";
import { KADRO_ROSTER, matchKadroMember, type KadroMember } from "./kadro-roster";

export const KADRO_MEDIA_DIR = path.join(process.cwd(), "docs", "backups", "kadro-team", "unzipped", "word", "media");
const FILENAME_PREFIX = "kadro-team/";

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

export type KadroImportResult = {
  created: number;
  filled: number;
  skipped: number;
  mediaCreated: number;
  mediaReused: number;
  backupPath: string | null;
};

async function upsertPhoto(
  db: Database,
  member: KadroMember,
  bytes: Buffer,
): Promise<{ id: string; created: boolean }> {
  const filename = originalName(member.photo);
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
  if (!sniffed) throw new Error(`Geçersiz görsel: ${member.photo}`);
  const inspected = await inspectImage(bytes);
  const id = crypto.randomUUID();
  const ext = EXTENSIONS[sniffed.mime] ?? "jpg";
  const storageKey = `uploads/${id}.${ext}`;
  await putObject(storageKey, bytes, db);
  const stored = await readObject(storageKey, db);
  if (!stored || stored.length !== bytes.length) {
    throw new Error(`Orijinal baytlar yazılamadı: ${member.photo}`);
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
      alt: clip(member.alt[locale], 200),
    })),
  );
  return { id, created: true };
}

async function fillTranslation(
  db: Database,
  memberId: string,
  member: KadroMember,
): Promise<{ created: number; filled: number; skipped: number }> {
  let created = 0;
  let filled = 0;
  let skipped = 0;
  const now = new Date();
  for (const locale of locales) {
    const [row] = await db
      .select({
        id: teamMemberTranslations.id,
        roleTitle: teamMemberTranslations.roleTitle,
        summary: teamMemberTranslations.summary,
        bio: teamMemberTranslations.bio,
      })
      .from(teamMemberTranslations)
      .where(and(eq(teamMemberTranslations.memberId, memberId), eq(teamMemberTranslations.locale, locale)));
    if (!row) {
      await db.insert(teamMemberTranslations).values({
        memberId,
        locale,
        roleTitle: member.role[locale],
        summary: member.summary[locale],
        bio: member.bio[locale],
        status: "published",
        publishedAt: now,
      });
      created += 1;
      continue;
    }
    const patch: { roleTitle?: string; summary?: string | null; bio?: string | null } = {};
    if (empty(row.roleTitle)) patch.roleTitle = member.role[locale];
    if (empty(row.summary)) patch.summary = member.summary[locale];
    if (empty(row.bio)) patch.bio = member.bio[locale];
    if (Object.keys(patch).length === 0) {
      skipped += 1;
      continue;
    }
    await db.update(teamMemberTranslations).set(patch).where(eq(teamMemberTranslations.id, row.id));
    filled += 1;
  }
  return { created, filled, skipped };
}

export async function importKadroTeam(
  db: Database,
  options: { mediaDir?: string; backupDir?: string } = {},
): Promise<KadroImportResult> {
  const mediaDir = options.mediaDir ?? KADRO_MEDIA_DIR;
  const existing = await db
    .select({
      id: teamMembers.id,
      fullName: teamMembers.fullName,
      photoAssetId: teamMembers.photoAssetId,
      presentationGroup: teamMembers.presentationGroup,
      isDemo: teamMembers.isDemo,
    })
    .from(teamMembers);

  const live = existing.filter((row) => !row.isDemo);
  const touched = live.filter((row) => matchKadroMember(row.fullName));
  let backupPath: string | null = null;
  if (touched.length > 0) {
    const dir = options.backupDir ?? path.join(process.cwd(), "docs", "backups");
    await mkdir(dir, { recursive: true });
    backupPath = path.join(dir, `kadro-team-${new Date().toISOString().slice(0, 10)}.json`);
    const translations = await db.select().from(teamMemberTranslations);
    await writeFile(
      backupPath,
      `${JSON.stringify(
        touched.map((row) => ({
          ...row,
          translations: translations.filter((item) => item.memberId === row.id),
        })),
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  const result: KadroImportResult = {
    created: 0,
    filled: 0,
    skipped: 0,
    mediaCreated: 0,
    mediaReused: 0,
    backupPath,
  };

  for (const member of KADRO_ROSTER) {
    const bytes = await readFile(path.join(mediaDir, member.photo));
    const photo = await upsertPhoto(db, member, bytes);
    if (photo.created) result.mediaCreated += 1;
    else result.mediaReused += 1;

    const matches = live.filter((row) => matchKadroMember(row.fullName)?.key === member.key);
    if (matches.length > 1) {
      throw new Error(`Birden fazla kayıt eşleşti: ${member.displayName}`);
    }
    let row = matches[0];
    if (!row) {
      const [created] = await db
        .insert(teamMembers)
        .values({
          fullName: member.displayName,
          photoAssetId: photo.id,
          presentationGroup: member.group,
          sortOrder: member.sortOrder,
          isVisible: true,
          isDemo: false,
        })
        .returning({
          id: teamMembers.id,
          fullName: teamMembers.fullName,
          photoAssetId: teamMembers.photoAssetId,
          presentationGroup: teamMembers.presentationGroup,
          isDemo: teamMembers.isDemo,
        });
      row = created;
      live.push(row);
      result.created += 1;
    } else {
      const patch: { photoAssetId?: string; presentationGroup?: string } = {};
      if (!row.photoAssetId) patch.photoAssetId = photo.id;
      if (!row.presentationGroup) patch.presentationGroup = member.group;
      if (Object.keys(patch).length > 0) {
        await db.update(teamMembers).set(patch).where(eq(teamMembers.id, row.id));
        result.filled += 1;
      }
    }

    const translation = await fillTranslation(db, row.id, member);
    result.created += translation.created;
    result.filled += translation.filled;
    result.skipped += translation.skipped;
  }

  return result;
}
