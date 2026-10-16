import { eq } from "drizzle-orm";
import { normalizeHomeLayout } from "../content/home-layout";
import type { Database } from "../db/client";
import { siteSettings, siteSettingTranslations } from "../db/schema";
import type { Locale } from "../i18n/config";
import { writeAudit } from "./audit";
import type { HomeCopyInput, HomeVisualsInput, SiteSettingsInput } from "./validation";

type Actor = { id: string; ip?: string | null };

export async function getSiteSettings(db: Database): Promise<SiteSettingsInput & HomeVisualsInput> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
  return {
    companyName: row?.companyName ?? null,
    contactEmail: row?.contactEmail ?? null,
    contactPhone: row?.contactPhone ?? null,
    postalAddress: row?.postalAddress ?? null,
    whatsapp: row?.whatsapp ?? null,
    socialLinks: (row?.socialLinks ?? []).filter((item) => item.label && item.url),
    logoAssetId: row?.logoAssetId ?? null,
    faviconAssetId: row?.faviconAssetId ?? null,
    heroImageAssetId: row?.heroImageAssetId ?? null,
    callToActionImageAssetId: row?.callToActionImageAssetId ?? null,
    heroVideoUrl: row?.heroVideoUrl ?? null,
    homeSections: normalizeHomeLayout(row?.homeSections),
  };
}

export async function updateSiteSettings(db: Database, actor: Actor, input: SiteSettingsInput): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .insert(siteSettings)
      .values({ id: 1, ...input, updatedById: actor.id })
      .onConflictDoUpdate({ target: siteSettings.id, set: { ...input, updatedById: actor.id } });
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "settings.update",
      entityType: "settings",
      entityId: "1",
      metadata: { fields: Object.keys(input) },
      ip: actor.ip,
    });
  });
}

export async function updateHomeVisuals(db: Database, actor: Actor, input: HomeVisualsInput): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .insert(siteSettings)
      .values({ id: 1, ...input, updatedById: actor.id })
      .onConflictDoUpdate({ target: siteSettings.id, set: { ...input, updatedById: actor.id } });
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "settings.update",
      entityType: "settings",
      entityId: "1",
      metadata: { fields: ["home"] },
      ip: actor.ip,
    });
  });
}

export async function getHomeCopy(db: Database, locale: Locale) {
  const [row] = await db
    .select()
    .from(siteSettingTranslations)
    .where(eq(siteSettingTranslations.locale, locale));
  return row ?? null;
}

export async function saveHomeCopy(
  db: Database,
  actor: Actor,
  locale: Locale,
  input: HomeCopyInput,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(siteSettings).values({ id: 1 }).onConflictDoNothing();
    const [existing] = await tx
      .select({ id: siteSettingTranslations.id })
      .from(siteSettingTranslations)
      .where(eq(siteSettingTranslations.locale, locale));
    if (existing) {
      await tx.update(siteSettingTranslations).set(input).where(eq(siteSettingTranslations.id, existing.id));
    } else {
      await tx.insert(siteSettingTranslations).values({ settingsId: 1, locale, ...input });
    }
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: existing ? "home.translation_update" : "home.translation_create",
      entityType: "settings",
      entityId: "1",
      metadata: { locale },
      ip: actor.ip,
    });
  });
}
