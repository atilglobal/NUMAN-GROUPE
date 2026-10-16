import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  cmsPages,
  cmsPageTranslations,
  expertises,
  mediaAssets,
  mediaPlacements,
  officialVisitGallery,
  officialVisits,
  projectGallery,
  projects,
  siteSettings,
  teamMembers,
} from "@/db/schema";

export type MediaUsage = { kind: string; id: string; label: string };

export async function listMediaUsage(db: Database, assetId: string): Promise<MediaUsage[]> {
  const [expertiseRows, projectCovers, projectGalleryRows, visitCovers, visitGalleryRows, teamRows, settings, cmsRoots, cmsTr, placements] =
    await Promise.all([
      db
        .select({ id: expertises.id })
        .from(expertises)
        .where(eq(expertises.coverAssetId, assetId)),
      db.select({ id: projects.id }).from(projects).where(eq(projects.coverAssetId, assetId)),
      db
        .select({ id: projectGallery.projectId })
        .from(projectGallery)
        .where(eq(projectGallery.assetId, assetId)),
      db.select({ id: officialVisits.id }).from(officialVisits).where(eq(officialVisits.coverAssetId, assetId)),
      db
        .select({ id: officialVisitGallery.visitId })
        .from(officialVisitGallery)
        .where(eq(officialVisitGallery.assetId, assetId)),
      db.select({ id: teamMembers.id, fullName: teamMembers.fullName }).from(teamMembers).where(eq(teamMembers.photoAssetId, assetId)),
      db.select().from(siteSettings).where(eq(siteSettings.id, 1)),
      db.select({ id: cmsPages.id, layout: cmsPages.layout, coverAssetId: cmsPages.coverAssetId }).from(cmsPages),
      db.select({ pageId: cmsPageTranslations.pageId, ogImageAssetId: cmsPageTranslations.ogImageAssetId }).from(cmsPageTranslations),
      db.select().from(mediaPlacements),
    ]);

  const usages: MediaUsage[] = [];
  for (const row of expertiseRows) usages.push({ kind: "Uzmanlık kapağı", id: row.id, label: row.id });
  for (const row of projectCovers) usages.push({ kind: "Proje kapağı", id: row.id, label: row.id });
  for (const row of projectGalleryRows) usages.push({ kind: "Proje galerisi", id: row.id, label: row.id });
  for (const row of visitCovers) usages.push({ kind: "Ziyaret kapağı", id: row.id, label: row.id });
  for (const row of visitGalleryRows) usages.push({ kind: "Ziyaret galerisi", id: row.id, label: row.id });
  for (const row of teamRows) usages.push({ kind: "Kadro fotoğrafı", id: row.id, label: row.fullName });
  const chrome = settings[0];
  if (chrome?.logoAssetId === assetId) usages.push({ kind: "Logo", id: "1", label: "Site ayarları" });
  if (chrome?.faviconAssetId === assetId) usages.push({ kind: "Favicon", id: "1", label: "Site ayarları" });
  if (chrome?.heroImageAssetId === assetId) usages.push({ kind: "Ana sayfa hero", id: "1", label: "Site ayarları" });
  if (chrome?.callToActionImageAssetId === assetId) usages.push({ kind: "Ana sayfa CTA", id: "1", label: "Site ayarları" });
  for (const page of cmsRoots) {
    if (page.coverAssetId === assetId) usages.push({ kind: "CMS kapak", id: page.id, label: page.id });
    if (JSON.stringify(page.layout).includes(assetId)) usages.push({ kind: "CMS blok görseli", id: page.id, label: page.id });
  }
  for (const row of cmsTr) {
    if (row.ogImageAssetId === assetId) usages.push({ kind: "CMS sosyal görsel", id: row.pageId, label: row.pageId });
  }
  for (const row of placements) {
    if (row.assetId === assetId || row.mobileAssetId === assetId) {
      usages.push({ kind: "Kırpma kullanımı", id: row.id, label: row.context });
    }
  }
  return usages;
}

export async function getStorageKey(db: Database, id: string) {
  const [row] = await db
    .select({ storageKey: mediaAssets.storageKey, mimeType: mediaAssets.mimeType })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id));
  return row ?? null;
}
