import { describe, expect, it } from "vitest";
import { locales } from "./config";
import {
  detailPath,
  isUnknownPublicPath,
  parsePath,
  sectionAlternates,
  sectionFromSlug,
  sections,
  sectionSlugs,
  translatePath,
} from "./routes";

describe("localized routes", () => {
  it("keeps section slugs unique within each language", () => {
    for (const locale of locales) {
      const slugs = sections.map((section) => sectionSlugs[section][locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("resolves every section slug back to its section", () => {
    for (const locale of locales) {
      for (const section of sections) {
        expect(sectionFromSlug(locale, sectionSlugs[section][locale])).toBe(section);
      }
    }
  });

  it("does not accept another language's slug", () => {
    expect(sectionFromSlug("fr", "projects")).toBeNull();
    expect(sectionFromSlug("en", "projets")).toBeNull();
  });

  it("parses home, section and detail paths", () => {
    expect(parsePath("/fr")).toEqual({ locale: "fr", section: null, slug: null });
    expect(parsePath("/en/institutional-visits")).toEqual({
      locale: "en",
      section: "visits",
      slug: null,
    });
    expect(parsePath("/en/official-visits")).toEqual({
      locale: "en",
      section: "visits",
      slug: null,
    });
    expect(parsePath("/fr/visites-institutionnelles")).toEqual({
      locale: "fr",
      section: "visits",
      slug: null,
    });
    expect(parsePath("/tr/projeler/ornek")).toEqual({
      locale: "tr",
      section: "projects",
      slug: "ornek",
    });
  });

  it("rejects unknown locales, sections and detail on non-detail sections", () => {
    expect(parsePath("/de")).toBeNull();
    expect(parsePath("/fr/unknown")).toBeNull();
    expect(parsePath("/fr/contact/x")).toBeNull();
    expect(parsePath("/fr/projets/a/b")).toBeNull();
  });

  it("flags unknown locale-prefixed paths for HTTP 404", () => {
    expect(isUnknownPublicPath("/fr")).toBe(false);
    expect(isUnknownPublicPath("/fr/projets")).toBe(false);
    expect(isUnknownPublicPath("/fr/projets/un-projet")).toBe(false);
    expect(isUnknownPublicPath("/fr/p/une-page")).toBe(false);
    expect(isUnknownPublicPath("/fr/inexistant-xyz")).toBe(true);
    expect(isUnknownPublicPath("/fr/contact/x")).toBe(true);
    expect(isUnknownPublicPath("/admin/kullanicilar")).toBe(false);
  });

  it("translates a section path into the matching section of another language", () => {
    expect(translatePath("/fr/visites-officielles", "tr")).toBe("/tr/resmi-ziyaretler");
    expect(translatePath("/tr/kadro", "en")).toBe("/en/team");
    expect(translatePath("/fr", "en")).toBe("/en");
  });

  it("falls back to the section list for detail pages without known alternates", () => {
    expect(translatePath("/fr/projets/un-projet", "en")).toBe("/en/projects");
  });

  it("falls back to the target home for unknown paths", () => {
    expect(translatePath("/fr/inconnu", "tr")).toBe("/tr");
  });

  it("builds detail and alternate paths", () => {
    expect(detailPath("fr", "expertises", "stades")).toBe("/fr/expertises/stades");
    expect(sectionAlternates("projects")).toEqual({
      fr: "/fr/projets",
      en: "/en/projects",
      tr: "/tr/projeler",
    });
  });
});
