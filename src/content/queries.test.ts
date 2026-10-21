import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import {
  expertises,
  expertiseTranslations,
  mediaAssets,
  mediaAssetTranslations,
  officialVisitGallery,
  officialVisitParticipants,
  officialVisitParticipantTranslations,
  officialVisits,
  officialVisitTranslations,
  pageContents,
  pageContentTranslations,
  projectGallery,
  projects,
  projectTranslations,
  siteSettings,
  siteSettingTranslations,
  teamMemberLinks,
  teamMembers,
  teamMemberTranslations,
} from "@/db/schema";
import { seedBase, seedDemo } from "@/db/seed/run";
import { createTestDb, truncateAll } from "@/db/testing";
import { locales, type Locale } from "@/i18n/config";
import {
  findDetail,
  findPage,
  findPreviewDetail,
  getHomeVisuals,
  getSiteChrome,
  listAboutSections,
  listExpertises,
  listProjects,
  listProjectsForExpertise,
  listProjectsPage,
  listPublishedEntries,
  listRelatedProjects,
  listTeam,
  listRelatedVisits,
  listVisits,
  listVisitsPage,
  publishedPageLocales,
} from "./queries";

let db: Database;
let close: () => Promise<void>;

const on = { demo: true };
const off = { demo: false };

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(async () => {
  await truncateAll(db);
  await seedBase(db);
  await seedDemo(db, { NODE_ENV: "development" });
});

type TranslationInput = { slug: string; title: string; published: boolean };

/** A real (non-demo) project with only the translations given. */
async function realProject(translations: Partial<Record<Locale, TranslationInput>>, coverAssetId?: string) {
  const [project] = await db
    .insert(projects)
    .values({ status: "completed", coverAssetId })
    .returning({ id: projects.id });
  for (const [locale, t] of Object.entries(translations) as [Locale, TranslationInput][]) {
    await db.insert(projectTranslations).values({
      projectId: project.id,
      locale,
      slug: t.slug,
      title: t.title,
      status: t.published ? "published" : "draft",
      publishedAt: t.published ? new Date() : null,
    });
  }
  return project.id;
}

describe("demo separation", () => {
  it.each(locales)("%s hides every demo entry and image when demo is off", async (locale) => {
    expect(await listProjects(db, locale, off)).toEqual([]);
    expect(await listVisits(db, locale, off)).toEqual([]);
    expect(await listTeam(db, locale, off)).toEqual([]);
    expect(await getHomeVisuals(db, locale, off)).toEqual({ hero: null, callToAction: null, heroVideoUrl: null });

    const expertises = await listExpertises(db, locale, off);
    expect(expertises).toHaveLength(4);
    expect(expertises.every((expertise) => expertise.image === null)).toBe(true);
  });

  it("marks demo entries and gives every demo image an alt text in each language", async () => {
    for (const locale of locales) {
      const projectViews = await listProjects(db, locale, on);
      expect(projectViews).toHaveLength(6);
      expect(new Set(projectViews.map((p) => p.status))).toEqual(new Set(["completed", "in_progress"]));
      for (const project of projectViews) {
        expect(project.isDemo).toBe(true);
        expect(project.image?.isDemo).toBe(true);
        expect(project.image?.alt.trim()).toBeTruthy();
      }
      for (const visit of await listVisits(db, locale, on)) expect(visit.isDemo).toBe(true);
      for (const member of await listTeam(db, locale, on)) expect(member.isDemo).toBe(true);
    }
  });

  it("refuses demo detail pages and leaves them out of published entries when off", async () => {
    const [demo] = await listProjects(db, "fr", on);
    expect(await findDetail(db, "projects", "fr", demo.slug, off)).toBeNull();

    const entries = await listPublishedEntries(db, off);
    expect(entries.every((entry) => entry.section === "expertises")).toBe(true);
    expect(entries).toHaveLength(4);
  });
});

describe("per-language publication", () => {
  it("excludes drafts from lists and detail lookups", async () => {
    await realProject({
      fr: { slug: "stade-reel", title: "Stade réel", published: true },
      en: { slug: "real-stadium", title: "Real stadium", published: false },
    });

    expect((await listProjects(db, "fr", off)).map((p) => p.title)).toEqual(["Stade réel"]);
    expect(await listProjects(db, "en", off)).toEqual([]);
    expect(await findDetail(db, "projects", "en", "real-stadium", off)).toBeNull();
  });

  it("never fills a missing language with another language's text", async () => {
    await realProject({ fr: { slug: "hopital-reel", title: "Hôpital réel", published: true } });

    for (const locale of ["en", "tr"] as const) {
      const titles = (await listProjects(db, locale, off)).map((p) => p.title);
      expect(titles).not.toContain("Hôpital réel");
    }
  });

  it("offers alternates only for the languages that are published", async () => {
    await realProject({
      fr: { slug: "logements-reels", title: "Logements réels", published: true },
      en: { slug: "real-housing", title: "Real housing", published: false },
      tr: { slug: "gercek-lojman", title: "Gerçek lojman", published: true },
    });

    const entry = await findDetail(db, "projects", "fr", "logements-reels", off);
    expect(entry?.slugs).toEqual({ fr: "logements-reels", tr: "gercek-lojman" });

    const published = (await listPublishedEntries(db, off)).filter((e) => e.section === "projects");
    expect(published).toHaveLength(1);
    expect(published[0].slugs).toEqual({ fr: "logements-reels", tr: "gercek-lojman" });
  });

  it("keeps a shared cover on every language and prefers that language's alt", async () => {
    const [asset] = await db
      .insert(mediaAssets)
      .values({ storageKey: "projects/cover.jpg", mimeType: "image/jpeg", byteSize: 100 })
      .returning({ id: mediaAssets.id });
    await db.insert(mediaAssetTranslations).values({ assetId: asset.id, locale: "fr", alt: "Façade" });
    await realProject(
      {
        fr: { slug: "projet-image", title: "Projet image", published: true },
        en: { slug: "image-project", title: "Image project", published: true },
      },
      asset.id,
    );

    const [fr] = await listProjects(db, "fr", off);
    const [en] = await listProjects(db, "en", off);
    expect(fr.image?.alt).toBe("Façade");
    expect(en.image?.src).toBe(fr.image?.src);
    expect(en.image?.alt).toBe("Façade");
  });

  it("lists published projects even when they have no expertise or country", async () => {
    await realProject({
      fr: { slug: "projet-libre", title: "Projet libre", published: true },
      en: { slug: "free-project", title: "Free project", published: true },
    });
    expect((await listProjects(db, "fr", off))[0]).toMatchObject({
      slug: "projet-libre",
      title: "Projet libre",
    });
    expect((await listProjects(db, "en", off))[0].slug).toBe("free-project");
  });

  it("serves institutional pages only in published languages", async () => {
    const [about] = await db
      .select({ id: pageContents.id })
      .from(pageContents)
      .where(eq(pageContents.key, "about"));
    await db.delete(pageContentTranslations).where(eq(pageContentTranslations.pageId, about.id));
    await db.insert(pageContentTranslations).values([
      { pageId: about.id, locale: "fr", title: "À propos", status: "published", publishedAt: new Date() },
      { pageId: about.id, locale: "en", title: "About", status: "draft" },
    ]);

    expect((await findPage(db, "about", "fr"))?.title).toBe("À propos");
    expect(await findPage(db, "about", "en")).toBeNull();
    expect(await findPage(db, "about", "tr")).toBeNull();
    expect(await publishedPageLocales(db, "about")).toEqual(["fr"]);
  });
});

const now = () => new Date();

async function asset(storageKey: string, alts: Partial<Record<Locale, string>>) {
  const [row] = await db
    .insert(mediaAssets)
    .values({ storageKey, mimeType: "image/jpeg", byteSize: 10 })
    .returning({ id: mediaAssets.id });
  for (const [locale, alt] of Object.entries(alts) as [Locale, string][]) {
    await db.insert(mediaAssetTranslations).values({ assetId: row.id, locale, alt });
  }
  return row.id;
}

describe("project detail", () => {
  it("returns provided facts, drops empty technical rows and images without alt", async () => {
    const id = await realProject({ fr: { slug: "stade-detail", title: "Stade", published: true } });
    await db
      .update(projects)
      .set({
        countryCode: "SN",
        startedOn: "2024-03-01",
        videoUrl: "https://video.example/stade",
      })
      .where(eq(projects.id, id));
    await db
      .update(projectTranslations)
      .set({
        city: "Dakar",
        technicalDetails: [
          { label: "Capacité", value: "50 000 places" },
          { label: "Surface", value: "" },
          { label: "  ", value: "12 ha" },
        ],
      })
      .where(eq(projectTranslations.projectId, id));
    const withAlt = await asset("g/1.jpg", { fr: "Tribune" });
    const withoutAlt = await asset("g/2.jpg", { en: "Stand" });
    await db.insert(projectGallery).values([
      { projectId: id, assetId: withoutAlt, sortOrder: 0 },
      { projectId: id, assetId: withAlt, sortOrder: 1 },
    ]);

    const entry = await findDetail(db, "projects", "fr", "stade-detail", off);
    expect(entry?.facts).toEqual({
      kind: "project",
      status: "completed",
    });
    expect(entry?.gallery.map((image) => image.alt)).toEqual(["Stand", "Tribune"]);
    expect(entry?.image).toBeNull();
  });

  it("orders featured projects first, then by sort order", async () => {
    const a = await realProject({ fr: { slug: "a", title: "A", published: true } });
    const b = await realProject({ fr: { slug: "b", title: "B", published: true } });
    const c = await realProject({ fr: { slug: "c", title: "C", published: true } });
    await db.update(projects).set({ sortOrder: 2 }).where(eq(projects.id, a));
    await db.update(projects).set({ sortOrder: 1 }).where(eq(projects.id, b));
    await db.update(projects).set({ isFeatured: true, sortOrder: 9 }).where(eq(projects.id, c));

    expect((await listProjects(db, "fr", off)).map((p) => p.title)).toEqual(["C", "B", "A"]);
  });

  it("keeps drafts off the public site and available to preview by id", async () => {
    const id = await realProject({ fr: { slug: "brouillon-projet", title: "Brouillon", published: false } });
    expect(await findDetail(db, "projects", "fr", "brouillon-projet", off)).toBeNull();
    expect(await findPreviewDetail(db, "projects", "fr", id)).toMatchObject({ title: "Brouillon" });
  });

  it("filters the public listing by showcase status only", async () => {
    const [stadiums] = await listExpertises(db, "fr", off);
    const planned = await realProject({ fr: { slug: "projet-planifie", title: "Planifié", published: true } });
    const ongoing = await realProject({ fr: { slug: "projet-cours", title: "En cours", published: true } });
    const done = await realProject({ fr: { slug: "projet-acheve", title: "Achevé", published: true } });
    await db.update(projects).set({ status: "planned" }).where(eq(projects.id, planned));
    await db.update(projects).set({ status: "in_progress" }).where(eq(projects.id, ongoing));
    await db
      .update(projects)
      .set({ status: "completed", expertiseId: stadiums.id, countryCode: "SN" })
      .where(eq(projects.id, done));

    const all = await listProjectsPage(db, "fr", off, { page: 1 });
    expect(all.items.map((item) => item.slug).sort()).toEqual([
      "projet-acheve",
      "projet-cours",
      "projet-planifie",
    ]);

    expect((await listProjectsPage(db, "fr", off, { status: "planned", page: 1 })).items.map((item) => item.slug)).toEqual([
      "projet-planifie",
    ]);
    expect(
      (await listProjectsPage(db, "fr", off, { status: "in_progress", page: 1 })).items.map((item) => item.slug),
    ).toEqual(["projet-cours"]);
    expect(
      (await listProjectsPage(db, "fr", off, { status: "completed", page: 1 })).items.map((item) => item.slug),
    ).toEqual(["projet-acheve"]);

    expect((await listProjectsForExpertise(db, "fr", off, stadiums.id)).map((item) => item.slug)).toEqual([
      "projet-acheve",
    ]);
    expect(
      (await listRelatedProjects(db, "fr", off, { projectId: done })).map((item) => item.slug),
    ).not.toContain("projet-acheve");
  });

  it("lists a newly published expertise without a code change", async () => {
    const [row] = await db.insert(expertises).values({ sortOrder: 40 }).returning({ id: expertises.id });
    await db.insert(expertiseTranslations).values({
      expertiseId: row.id,
      locale: "fr",
      slug: "infrastructures",
      name: "Infrastructures",
      status: "published",
      publishedAt: now(),
    });
    expect((await listExpertises(db, "fr", off)).map((item) => item.slug)).toContain("infrastructures");
  });
});

describe("official visit detail", () => {
  it("lists participants with a role title only where one was provided in that language", async () => {
    const [visit] = await db
      .insert(officialVisits)
      .values({ visitedOn: "2025-05-12" })
      .returning({ id: officialVisits.id });
    await db.insert(officialVisitTranslations).values([
      { visitId: visit.id, locale: "fr", slug: "visite", title: "Visite", status: "published", publishedAt: now() },
      { visitId: visit.id, locale: "en", slug: "visit", title: "Visit", status: "published", publishedAt: now() },
    ]);
    const [withTitle] = await db
      .insert(officialVisitParticipants)
      .values([
        { visitId: visit.id, fullName: "Personne A", sortOrder: 1 },
        { visitId: visit.id, fullName: "Personne B", sortOrder: 2 },
      ])
      .returning({ id: officialVisitParticipants.id });
    await db
      .insert(officialVisitParticipantTranslations)
      .values({ participantId: withTitle.id, locale: "fr", roleTitle: "Directeur" });

    const fr = await findDetail(db, "visits", "fr", "visite", off);
    const en = await findDetail(db, "visits", "en", "visit", off);
    expect(fr?.facts).toEqual({
      kind: "visit",
      visitedOn: "2025-05-12",
      host: null,
      place: null,
      countryCode: null,
      participants: [
        { fullName: "Personne A", roleTitle: "Directeur" },
        { fullName: "Personne B", roleTitle: null },
      ],
    });
    expect(en?.facts.kind === "visit" && en.facts.participants).toEqual([
      { fullName: "Personne A", roleTitle: null },
      { fullName: "Personne B", roleTitle: null },
    ]);
  });

  async function visit(input: {
    slug: string;
    title: string;
    visitedOn: string;
    country: string;
    featured?: boolean;
    summary?: string;
  }) {
    const [row] = await db
      .insert(officialVisits)
      .values({
        visitedOn: input.visitedOn,
        countryCode: input.country,
        isFeatured: input.featured ?? false,
      })
      .returning({ id: officialVisits.id });
    await db.insert(officialVisitTranslations).values({
      visitId: row.id,
      locale: "fr",
      slug: input.slug,
      title: input.title,
      summary: input.summary ?? null,
      status: "published",
      publishedAt: now(),
    });
    return row.id;
  }

  it("lists published visits newest first and only featured ones when asked", async () => {
    await visit({ slug: "ancienne", title: "Ancienne", visitedOn: "2022-01-01", country: "FR" });
    await visit({ slug: "recente", title: "Récente", visitedOn: "2024-12-01", country: "SN", featured: true, summary: "Compte rendu" });
    await visit({ slug: "milieu", title: "Milieu", visitedOn: "2023-06-01", country: "FR", featured: true });

    expect((await listVisits(db, "fr", off)).map((item) => item.slug)).toEqual(["recente", "milieu", "ancienne"]);
    expect((await listVisits(db, "fr", { ...off, featuredOnly: true })).map((item) => item.slug)).toEqual([
      "recente",
      "milieu",
    ]);
    expect((await listVisits(db, "fr", off)).find((item) => item.slug === "recente")?.summary).toBe("Compte rendu");
  });

  it("filters the public visit list by country and year", async () => {
    await visit({ slug: "paris-2024", title: "Paris 2024", visitedOn: "2024-03-10", country: "FR" });
    await visit({ slug: "dakar-2024", title: "Dakar 2024", visitedOn: "2024-08-02", country: "SN" });
    await visit({ slug: "paris-2023", title: "Paris 2023", visitedOn: "2023-11-01", country: "FR" });

    const france = await listVisitsPage(db, "fr", off, { country: "FR", page: 1 });
    expect(france.items.map((item) => item.slug)).toEqual(["paris-2024", "paris-2023"]);
    expect(france.countries.map((item) => item.code).sort()).toEqual(["FR", "SN"]);
    expect(france.years.sort((a, b) => b - a)).toEqual([2024, 2023]);

    const year = await listVisitsPage(db, "fr", off, { year: 2024, page: 1 });
    expect(year.items.map((item) => item.slug)).toEqual(["dakar-2024", "paris-2024"]);
  });

  it("relates visits in the same country only and returns gallery captions", async () => {
    const [asset] = await db
      .insert(mediaAssets)
      .values({ storageKey: "visit-gallery.jpg", mimeType: "image/jpeg", byteSize: 12 })
      .returning({ id: mediaAssets.id });
    await db.insert(mediaAssetTranslations).values({
      assetId: asset.id,
      locale: "fr",
      alt: "Salle vide",
      caption: "Illustration : salle de réunion",
    });

    const current = await visit({ slug: "visite-a", title: "Visite A", visitedOn: "2024-01-01", country: "FR" });
    await visit({ slug: "visite-b", title: "Visite B", visitedOn: "2023-01-01", country: "FR" });
    await visit({ slug: "visite-c", title: "Visite C", visitedOn: "2022-01-01", country: "SN" });
    await db.insert(officialVisitGallery).values({ visitId: current, assetId: asset.id, sortOrder: 0 });

    expect(
      (await listRelatedVisits(db, "fr", off, { visitId: current, countryCode: "FR" })).map((item) => item.slug),
    ).toEqual(["visite-b"]);
    expect(await listRelatedVisits(db, "fr", off, { visitId: current, countryCode: null })).toEqual([]);

    const detail = await findDetail(db, "visits", "fr", "visite-a", off);
    expect(detail?.gallery).toEqual(
      expect.arrayContaining([expect.objectContaining({ alt: "Salle vide", caption: "Illustration : salle de réunion" })]),
    );
  });
});

describe("team", () => {
  async function member(fullName: string, isVisible: boolean) {
    const [row] = await db
      .insert(teamMembers)
      .values({ fullName, isVisible })
      .returning({ id: teamMembers.id });
    await db.insert(teamMemberTranslations).values({
      memberId: row.id,
      locale: "fr",
      roleTitle: "Direction",
      status: "published",
      publishedAt: now(),
    });
    return row.id;
  }

  it("hides members marked not visible and returns their professional links", async () => {
    const shown = await member("Personne visible", true);
    await member("Personne masquée", false);
    await db.insert(teamMemberLinks).values({ memberId: shown, label: "LinkedIn", url: "https://linkedin.example/p" });

    const team = await listTeam(db, "fr", off);
    expect(team.map((m) => m.fullName)).toEqual(["Personne visible"]);
    expect(team[0].links).toEqual([{ label: "LinkedIn", url: "https://linkedin.example/p" }]);
  });
});

describe("site chrome and about blocks", () => {
  it("omits empty contact and social fields", async () => {
    await db
      .update(siteSettings)
      .set({
        contactEmail: "hello@example.org",
        contactPhone: null,
        postalAddress: null,
        whatsapp: null,
        socialLinks: [
          { label: "Empty", url: "" },
          { label: "Site", url: "https://example.org" },
        ],
      })
      .where(eq(siteSettings.id, 1));

    const chrome = await getSiteChrome(db, "fr", off);
    expect(chrome.groupLayout.find((item) => item.key === "quality")).toEqual({
      key: "quality",
      visible: false,
    });
    expect(chrome.contactEmail).toBe("hello@example.org");
    expect(chrome.contactPhone).toBeNull();
    expect(chrome.whatsapp).toBeNull();
    expect(chrome.socialLinks).toEqual([{ label: "Site", url: "https://example.org" }]);
  });

  it("exposes home copy only once published", async () => {
    await db.delete(siteSettingTranslations).where(eq(siteSettingTranslations.locale, "fr"));
    await db.insert(siteSettingTranslations).values({
      settingsId: 1,
      locale: "fr",
      heroTitle: "Titre CMS",
      status: "draft",
    });
    expect((await getSiteChrome(db, "fr", off)).copy).toBeNull();

    await db
      .update(siteSettingTranslations)
      .set({ status: "published", publishedAt: now() })
      .where(eq(siteSettingTranslations.locale, "fr"));
    expect((await getSiteChrome(db, "fr", off)).copy?.heroTitle).toBe("Titre CMS");
  });

  it("skips unpublished about blocks and empty certificates", async () => {
    const pages = await db.select({ id: pageContents.id, key: pageContents.key }).from(pageContents);
    const idOf = (key: string) => pages.find((row) => row.key === key)!.id;
    await db
      .delete(pageContentTranslations)
      .where(eq(pageContentTranslations.pageId, idOf("mission")));
    await db
      .delete(pageContentTranslations)
      .where(eq(pageContentTranslations.pageId, idOf("approach")));
    await db
      .delete(pageContentTranslations)
      .where(eq(pageContentTranslations.pageId, idOf("quality")));
    await db
      .delete(pageContentTranslations)
      .where(eq(pageContentTranslations.pageId, idOf("certificates")));
    await db.insert(pageContentTranslations).values([
      {
        pageId: idOf("mission"),
        locale: "fr",
        title: "Mission",
        summary: "Texte",
        status: "published",
        publishedAt: now(),
      },
      { pageId: idOf("approach"), locale: "fr", title: "Approche", status: "draft" },
      { pageId: idOf("certificates"), locale: "fr", title: "Certificats", status: "published", publishedAt: now() },
    ]);
    const sections = await listAboutSections(db, "fr");
    expect(sections.map((row) => row.key)).toEqual(["mission"]);
  });
});
