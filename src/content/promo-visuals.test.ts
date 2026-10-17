import { describe, expect, it } from "vitest";
import { promoForExpertiseSlug, promoHero } from "./promo-visuals";

describe("promo visuals", () => {
  it("maps every seeded expertise slug to a bundled brand file", () => {
    for (const slug of ["stades", "stadiums", "stadyumlar", "hopitaux", "hospitals", "hastaneler"]) {
      const image = promoForExpertiseSlug(slug, "fr");
      expect(image?.src.startsWith("/brand/")).toBe(true);
      expect(image?.isDemo).toBe(false);
    }
  });

  it("does not invent a cover for an unknown slug", () => {
    expect(promoForExpertiseSlug("unknown-client-project", "en")).toBeNull();
  });

  it("keeps the hero illustration off the demo flag", () => {
    expect(promoHero("tr").isDemo).toBe(false);
    expect(promoHero("tr").src).toBe("/brand/hero-stadium.jpg");
  });
});
