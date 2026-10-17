import { and, eq, inArray, isNull } from "drizzle-orm";
import { isDemoContentEnabled } from "../../content/demo-policy";
import { locales, type Locale } from "../../i18n/config";
import type { Database } from "../client";
import {
  expertises,
  expertiseTranslations,
  mediaAssets,
  mediaAssetTranslations,
  officialVisits,
  officialVisitGallery,
  officialVisitTranslations,
  pageContents,
  pageContentTranslations,
  projectGallery,
  projects,
  projectTranslations,
  siteSettings,
  siteSettingTranslations,
  teamMembers,
  teamMemberTranslations,
} from "../schema";
import { baseExpertises, basePageKeys } from "./base";
import { expertiseBodies, homeCopy, pageCopy } from "./demo-copy";
import {
  demoExpertiseCovers,
  demoImages,
  demoProjects,
  demoTeam,
  demoVisits,
  type DemoImageKey,
  type DemoImageSeed,
} from "./demo";

const published = () => ({ status: "published" as const, publishedAt: new Date() });

/** Idempotent: existing expertises (matched by French slug) and pages are left untouched. */
export async function seedBase(db: Database): Promise<{ expertisesCreated: number }> {
  return db.transaction(async (tx) => {
    let expertisesCreated = 0;

    for (const seed of baseExpertises) {
      const [existing] = await tx
        .select({ id: expertiseTranslations.id })
        .from(expertiseTranslations)
        .where(and(eq(expertiseTranslations.locale, "fr"), eq(expertiseTranslations.slug, seed.slug.fr)));
      if (existing) continue;

      const [row] = await tx
        .insert(expertises)
        .values({ sortOrder: seed.sortOrder, isSeed: true })
        .returning({ id: expertises.id });
      await tx.insert(expertiseTranslations).values(
        locales.map((locale) => ({
          expertiseId: row.id,
          locale,
          slug: seed.slug[locale],
          name: seed.name[locale],
          summary: seed.summary[locale],
          ...published(),
        })),
      );
      expertisesCreated += 1;
    }

    await tx
      .insert(pageContents)
      .values(basePageKeys.map((key) => ({ key })))
      .onConflictDoNothing();
    await tx.insert(siteSettings).values({ id: 1 }).onConflictDoNothing();

    return { expertisesCreated };
  });
}

export class DemoContentDisabledError extends Error {
  constructor() {
    super(
      "Demo content is disabled in this environment (SITE_ENV=production or ALLOW_DEMO_CONTENT=false); refusing to seed it. Set ALLOW_DEMO_SEED=true only for this script if you must load demo rows into a database whose SITE_ENV is still production.",
    );
    this.name = "DemoContentDisabledError";
  }
}

type SeedEnv = Parameters<typeof isDemoContentEnabled>[0] & { ALLOW_DEMO_SEED?: string };

function mayWriteDemoSeed(env: SeedEnv): boolean {
  if (env.ALLOW_DEMO_SEED === "true") return true;
  return isDemoContentEnabled(env);
}

function emptyText(value: string | null | undefined): boolean {
  return !value?.trim();
}

/** Removes every demo row. Demo media detach automatically (foreign keys set null). */
export async function clearDemo(db: Database): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(projects).where(eq(projects.isDemo, true));
    await tx.delete(officialVisits).where(eq(officialVisits.isDemo, true));
    await tx.delete(teamMembers).where(eq(teamMembers.isDemo, true));
    await tx.delete(expertises).where(eq(expertises.isDemo, true));
    await tx.delete(mediaAssets).where(eq(mediaAssets.isDemo, true));
  });
}

/** Replaces existing demo rows; expects the base seed so projects can link to expertises. */
export async function seedDemo(db: Database, env: SeedEnv = process.env): Promise<void> {
  if (!mayWriteDemoSeed(env)) throw new DemoContentDisabledError();

  await clearDemo(db);

  await db.transaction(async (tx) => {
    const imageIds = {} as Record<DemoImageKey, string>;
    for (const image of Object.values(demoImages) as DemoImageSeed[]) {
      const [asset] = await tx
        .insert(mediaAssets)
        .values({
          storageKey: image.storageKey,
          mimeType: "image/jpeg",
          byteSize: image.byteSize,
          width: image.width,
          height: image.height,
          isDemo: true,
        })
        .returning({ id: mediaAssets.id });
      imageIds[image.key as DemoImageKey] = asset.id;
      await tx.insert(mediaAssetTranslations).values(
        locales.map((locale) => ({
          assetId: asset.id,
          locale,
          alt: image.alt[locale],
          caption: image.caption?.[locale] ?? null,
        })),
      );
    }

    const expertiseRows = await tx
      .select({ id: expertiseTranslations.expertiseId, slug: expertiseTranslations.slug })
      .from(expertiseTranslations)
      .where(
        and(
          eq(expertiseTranslations.locale, "fr"),
          inArray(expertiseTranslations.slug, Object.keys(demoExpertiseCovers)),
        ),
      );
    const expertiseBySlug = new Map(expertiseRows.map((row) => [row.slug, row.id]));

    for (const [slug, imageKey] of Object.entries(demoExpertiseCovers)) {
      const expertiseId = expertiseBySlug.get(slug);
      if (!expertiseId) continue;
      await tx
        .update(expertises)
        .set({ coverAssetId: imageIds[imageKey] })
        .where(and(eq(expertises.id, expertiseId), isNull(expertises.coverAssetId)));
      const bodyByLocale = expertiseBodies[slug];
      if (!bodyByLocale) continue;
      for (const locale of locales) {
        await tx
          .update(expertiseTranslations)
          .set({ body: bodyByLocale[locale] })
          .where(
            and(
              eq(expertiseTranslations.expertiseId, expertiseId),
              eq(expertiseTranslations.locale, locale),
              isNull(expertiseTranslations.body),
            ),
          );
      }
    }

    for (const seed of demoProjects) {
      const [project] = await tx
        .insert(projects)
        .values({
          expertiseId: expertiseBySlug.get(seed.expertiseSlugFr) ?? null,
          status: seed.status,
          coverAssetId: imageIds[seed.cover],
          isFeatured: seed.isFeatured,
          sortOrder: seed.sortOrder,
          isDemo: true,
        })
        .returning({ id: projects.id });
      await tx.insert(projectTranslations).values(
        locales.map((locale: Locale) => ({
          projectId: project.id,
          locale,
          slug: seed.slug[locale],
          title: seed.title[locale],
          summary: seed.summary[locale],
          body: seed.body[locale],
          seoTitle: seed.seoTitle[locale],
          seoDescription: seed.seoDescription[locale],
          ...published(),
        })),
      );
      if (seed.gallery.length > 0) {
        await tx.insert(projectGallery).values(
          seed.gallery.map((key, index) => ({
            projectId: project.id,
            assetId: imageIds[key],
            sortOrder: index,
          })),
        );
      }
    }

    for (const seed of demoVisits) {
      const [visit] = await tx
        .insert(officialVisits)
        .values({
          visitedOn: seed.visitedOn,
          coverAssetId: imageIds[seed.cover],
          isFeatured: seed.isFeatured,
          isDemo: true,
        })
        .returning({ id: officialVisits.id });
      await tx.insert(officialVisitTranslations).values(
        locales.map((locale) => ({
          visitId: visit.id,
          locale,
          slug: seed.slug[locale],
          title: seed.title[locale],
          hostInstitution: seed.host[locale],
          location: seed.location[locale],
          summary: seed.summary[locale],
          body: seed.body[locale],
          seoTitle: seed.seoTitle[locale],
          seoDescription: seed.seoDescription[locale],
          ...published(),
        })),
      );
      if (seed.gallery.length > 0) {
        await tx.insert(officialVisitGallery).values(
          seed.gallery.map((key, index) => ({
            visitId: visit.id,
            assetId: imageIds[key],
            sortOrder: index,
          })),
        );
      }
    }

    for (const seed of demoTeam) {
      const [member] = await tx
        .insert(teamMembers)
        .values({ fullName: seed.fullName, sortOrder: seed.sortOrder, isDemo: true })
        .returning({ id: teamMembers.id });
      await tx.insert(teamMemberTranslations).values(
        locales.map((locale) => ({
          memberId: member.id,
          locale,
          roleTitle: seed.roleTitle[locale],
          bio: seed.bio[locale],
          ...published(),
        })),
      );
    }

    await tx.insert(siteSettings).values({ id: 1 }).onConflictDoNothing();
    const [settings] = await tx
      .select({
        heroImageAssetId: siteSettings.heroImageAssetId,
        callToActionImageAssetId: siteSettings.callToActionImageAssetId,
      })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1));
    await tx
      .update(siteSettings)
      .set({
        heroImageAssetId: settings?.heroImageAssetId ?? imageIds.hero,
        callToActionImageAssetId: settings?.callToActionImageAssetId ?? imageIds.construction,
      })
      .where(eq(siteSettings.id, 1));

    for (const [key, copy] of Object.entries(pageCopy)) {
      const [page] = await tx
        .select({ id: pageContents.id })
        .from(pageContents)
        .where(eq(pageContents.key, key as (typeof basePageKeys)[number]));
      if (!page) continue;
      for (const locale of locales) {
        const [existing] = await tx
          .select({ id: pageContentTranslations.id })
          .from(pageContentTranslations)
          .where(
            and(eq(pageContentTranslations.pageId, page.id), eq(pageContentTranslations.locale, locale)),
          );
        if (existing) continue;
        const text = copy[locale];
        await tx.insert(pageContentTranslations).values({
          pageId: page.id,
          locale,
          title: text.title,
          summary: text.summary,
          body: text.body,
          seoTitle: text.seoTitle,
          seoDescription: text.seoDescription,
          ...published(),
        });
      }
    }

    for (const locale of locales) {
      const text = homeCopy[locale];
      const [existing] = await tx
        .select()
        .from(siteSettingTranslations)
        .where(and(eq(siteSettingTranslations.settingsId, 1), eq(siteSettingTranslations.locale, locale)));
      if (!existing) {
        await tx.insert(siteSettingTranslations).values({
          settingsId: 1,
          locale,
          heroTitle: text.heroTitle,
          heroDescription: text.heroDescription,
          introTitle: text.introTitle,
          introBody: text.introBody,
          ctaTitle: text.ctaTitle,
          ctaDescription: text.ctaDescription,
          ctaLabel: text.ctaLabel,
          ctaHref: text.ctaHref,
          footerTagline: text.footerTagline,
          seoTitle: text.seoTitle,
          seoDescription: text.seoDescription,
          ...published(),
        });
        continue;
      }
      await tx
        .update(siteSettingTranslations)
        .set({
          heroTitle: emptyText(existing.heroTitle) ? text.heroTitle : existing.heroTitle,
          heroDescription: emptyText(existing.heroDescription) ? text.heroDescription : existing.heroDescription,
          introTitle: emptyText(existing.introTitle) ? text.introTitle : existing.introTitle,
          introBody: emptyText(existing.introBody) ? text.introBody : existing.introBody,
          ctaTitle: emptyText(existing.ctaTitle) ? text.ctaTitle : existing.ctaTitle,
          ctaDescription: emptyText(existing.ctaDescription) ? text.ctaDescription : existing.ctaDescription,
          ctaLabel: emptyText(existing.ctaLabel) ? text.ctaLabel : existing.ctaLabel,
          ctaHref: emptyText(existing.ctaHref) ? text.ctaHref : existing.ctaHref,
          footerTagline: emptyText(existing.footerTagline) ? text.footerTagline : existing.footerTagline,
          seoTitle: emptyText(existing.seoTitle) ? text.seoTitle : existing.seoTitle,
          seoDescription: emptyText(existing.seoDescription) ? text.seoDescription : existing.seoDescription,
        })
        .where(eq(siteSettingTranslations.id, existing.id));
    }
  });
}
