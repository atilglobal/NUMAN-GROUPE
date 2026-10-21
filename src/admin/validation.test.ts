import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  createUserSchema,
  expertiseTranslationSchema,
  fieldErrors,
  projectDraftTranslationSchema,
  projectRootSchema,
  projectTranslationSchema,
  siteSettingsSchema,
  visitRootSchema,
} from "./validation";

describe("panel validation", () => {
  it("normalises a new user and enforces the password length", () => {
    const ok = createUserSchema.parse({ name: " Ayşe ", email: " Ayse@Example.ORG ", role: "editor", password: "x".repeat(12) });
    expect(ok).toMatchObject({ name: "Ayşe", email: "ayse@example.org" });
    expect(createUserSchema.parse({ name: "Yönetici", email: "admin", role: "admin", password: "Admin123" })).toMatchObject({
      email: "admin",
    });

    const result = createUserSchema.safeParse({ name: "", email: "not an email", role: "owner", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(fieldErrors(result.error)).sort()).toEqual(["email", "name", "password", "role"]);
    }
  });

  it("requires matching new passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old",
      newPassword: "a long new password",
      confirmPassword: "something else",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).confirmPassword).toBe("Parolalar eşleşmiyor.");
  });

  it("accepts only URL-safe slugs and stores empty optional text as null", () => {
    expect(
      expertiseTranslationSchema.parse({
        name: "Stades",
        slug: "Stades-2026",
        summary: " ",
        body: "",
        seoTitle: " ",
        seoDescription: "",
      }),
    ).toEqual({
      name: "Stades",
      slug: "stades-2026",
      summary: null,
      body: null,
      seoTitle: null,
      seoDescription: null,
    });
    for (const slug of ["stades nationaux", "stade--x", "-x", "été", "a/b"]) {
      expect(expertiseTranslationSchema.safeParse({ name: "X", slug, summary: "", body: "" }).success).toBe(false);
    }
  });

  it("validates settings without inventing defaults", () => {
    expect(
      siteSettingsSchema.parse({
        companyName: "",
        contactEmail: "",
        contactPhone: "",
        postalAddress: "",
        whatsapp: "",
        logoAssetId: "",
        faviconAssetId: "",
        socialLinks: [{ label: "X", url: "" }],
      }),
    ).toEqual({
      companyName: null,
      contactEmail: null,
      contactPhone: null,
      postalAddress: null,
      whatsapp: null,
      logoAssetId: null,
      faviconAssetId: null,
      socialLinks: [],
    });
    expect(siteSettingsSchema.safeParse({ companyName: "", contactEmail: "bad", contactPhone: "", postalAddress: "" }).success).toBe(false);
  });

  it("allows a draft project with title and status only", () => {
    const draft = projectDraftTranslationSchema.parse({
      title: "Stade d'été",
      slug: "",
      summary: "",
      body: "",
      seoTitle: "",
      seoDescription: "",
    });
    expect(draft).toMatchObject({ title: "Stade d'été", slug: "", summary: null, body: null });
    expect(projectDraftTranslationSchema.safeParse({ title: "", slug: "", summary: "", body: "" }).success).toBe(false);
    expect(projectDraftTranslationSchema.safeParse({ title: "X", slug: "été", summary: "", body: "" }).success).toBe(false);
    expect(projectTranslationSchema.safeParse({ title: "X", slug: "", summary: "", body: "" }).success).toBe(false);
  });

  it("accepts a project without country or expertise", () => {
    const parsed = projectRootSchema.parse({
      status: "planned",
      sortOrder: "0",
      coverAssetId: "",
      gallery: [],
    });
    expect(parsed).toMatchObject({
      status: "planned",
      isFeatured: false,
      coverAssetId: null,
      gallery: [],
    });
    expect(projectRootSchema.parse({ status: "in_progress", sortOrder: 1, coverAssetId: "", gallery: [] }).status).toBe(
      "in_progress",
    );
    expect(projectRootSchema.parse({ status: "completed", sortOrder: 1, coverAssetId: "", gallery: [] }).status).toBe(
      "completed",
    );
  });

  it("drops empty visit participants and treats featured as a checkbox", () => {
    const parsed = visitRootSchema.parse({
      visitedOn: "2024-11-18",
      countryCode: "fr",
      isFeatured: "on",
      coverAssetId: "",
      gallery: [],
      participants: [
        { fullName: "  ", roleFr: "", roleEn: "", roleTr: "" },
        { fullName: "Personne A", roleFr: "Directeur", roleEn: "", roleTr: "" },
      ],
    });
    expect(parsed).toMatchObject({
      visitedOn: "2024-11-18",
      countryCode: "FR",
      isFeatured: true,
      coverAssetId: null,
      participants: [{ fullName: "Personne A", roleFr: "Directeur", roleEn: null, roleTr: null }],
    });
  });
});
