import { and, eq, inArray } from "drizzle-orm";
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
  projects,
  projectTranslations,
  siteSettings,
  teamMembers,
  teamMemberTranslations,
} from "../schema";
import { baseExpertises, basePageKeys } from "./base";
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
      "Demo content is disabled in this environment (SITE_ENV=production or ALLOW_DEMO_CONTENT=false); refusing to seed it.",
    );
    this.name = "DemoContentDisabledError";
  }
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

type DemoEnv = Parameters<typeof isDemoContentEnabled>[0];

/** Replaces existing demo rows; expects the base seed so projects can link to expertises. */
export async function seedDemo(db: Database, env: DemoEnv = process.env): Promise<void> {
  if (!isDemoContentEnabled(env)) throw new DemoContentDisabledError();

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
        .where(eq(expertises.id, expertiseId));
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
          ...published(),
        })),
      );
    }

    for (const seed of demoVisits) {
      const [visit] = await tx
        .insert(officialVisits)
        .values({
          visitedOn: seed.visitedOn,
          countryCode: seed.countryCode,
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
    await tx
      .update(siteSettings)
      .set({ heroImageAssetId: imageIds.hero, callToActionImageAssetId: imageIds.construction })
      .where(eq(siteSettings.id, 1));
  });
}
