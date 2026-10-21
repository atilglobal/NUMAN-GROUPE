import { describe, expect, it } from "vitest";
import { isValidSlug, nextSlugCandidate, slugFromTitle } from "./slug";

describe("slugFromTitle", () => {
  it("transliterates French and Turkish letters", () => {
    expect(slugFromTitle("Stade d'été")).toBe("stade-d-ete");
    expect(slugFromTitle("Şehir Hastanesi")).toBe("sehir-hastanesi");
    expect(slugFromTitle("  Hôpital  National  ")).toBe("hopital-national");
  });

  it("returns empty when nothing usable remains", () => {
    expect(slugFromTitle("***")).toBe("");
    expect(slugFromTitle("")).toBe("");
  });
});

describe("slug helpers", () => {
  it("accepts only the stored pattern", () => {
    expect(isValidSlug("stade-national")).toBe(true);
    expect(isValidSlug("été")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });

  it("appends a numeric suffix without breaking the format", () => {
    expect(nextSlugCandidate("stade", 1)).toBe("stade");
    expect(nextSlugCandidate("stade", 2)).toBe("stade-2");
    expect(nextSlugCandidate("***", 1)).toBe("projet");
  });
});
