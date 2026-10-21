import { describe, expect, it } from "vitest";
import { newProjectFormData, parseProjectForm } from "./project-form";
import { featuredSchema, fieldErrors, projectRootSchema, summarizeFieldErrors } from "./validation";

describe("new project FormData vs schema", () => {
  it("rejects an unchecked featured checkbox the way the browser posts it (null)", () => {
    const fromGet = featuredSchema.safeParse(null);
    expect(fromGet.success).toBe(true);
    if (fromGet.success) expect(fromGet.data).toBe(false);

    const previous = projectRootSchema.safeParse({
      status: "planned",
      isFeatured: null,
      sortOrder: "0",
      coverAssetId: "",
      gallery: [],
    });
    expect(previous.success).toBe(true);
    if (previous.success) expect(previous.data.isFeatured).toBe(false);
  });

  it("saves a draft from title + status only, matching an unchecked checkbox FormData", () => {
    const form = newProjectFormData({ title: "Stade national", status: "planned" });
    expect(form.get("isFeatured")).toBeNull();
    expect(form.get("coverAssetId")).toBe("");
    expect(form.getAll("gallery")).toEqual([]);

    const parsed = parseProjectForm(form);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.translation).toMatchObject({ title: "Stade national", slug: "", summary: null });
    expect(parsed.root).toMatchObject({
      status: "planned",
      isFeatured: false,
      sortOrder: 0,
      coverAssetId: null,
      gallery: [],
    });
  });

  it("saves a full draft with copy, SEO, cover and gallery", () => {
    const cover = "11111111-1111-4111-8111-111111111111";
    const a = "22222222-2222-4222-8222-222222222222";
    const b = "33333333-3333-4333-8333-333333333333";
    const form = newProjectFormData({
      title: "Hôpital régional",
      status: "in_progress",
      slug: "hopital-regional",
      summary: "Résumé du projet",
      body: "## Corps",
      seoTitle: "Hôpital",
      seoDescription: "SEO",
      sortOrder: "3",
      featured: true,
      coverAssetId: cover,
      gallery: [a, b],
    });
    form.set(`alt-${cover}-fr`, "Façade");
    form.set(`caption-${a}-tr`, "Salon");

    const parsed = parseProjectForm(form);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.root).toMatchObject({
      status: "in_progress",
      isFeatured: true,
      sortOrder: 3,
      coverAssetId: cover,
      gallery: [a, b],
    });
    expect(parsed.translation).toMatchObject({
      title: "Hôpital régional",
      slug: "hopital-regional",
      summary: "Résumé du projet",
      seoTitle: "Hôpital",
    });
  });

  it("names every failed field so the form can mark it", () => {
    const form = newProjectFormData({ title: "", status: "not-a-status", sortOrder: "x", coverAssetId: "nope", gallery: ["also-bad"] });
    const parsed = parseProjectForm(form);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(Object.keys(parsed.fieldErrors).sort()).toEqual(
      expect.arrayContaining(["title", "status", "sortOrder", "coverAssetId", "gallery"]),
    );
    expect(parsed.message).toContain("Başlık:");
    expect(parsed.message).toContain("Proje durumu:");
    expect(parsed.message).toContain("Kapak görseli:");
    expect(parsed.message).toContain("Galeri:");
    expect(summarizeFieldErrors(parsed.fieldErrors)).toContain("Sıra:");
  });

  it("keeps the featured error key when a garbage value is posted", () => {
    const result = projectRootSchema.safeParse({
      status: "planned",
      isFeatured: "yes",
      sortOrder: 0,
      coverAssetId: "",
      gallery: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)).toMatchObject({ isFeatured: expect.any(String) });
    }
  });
});
