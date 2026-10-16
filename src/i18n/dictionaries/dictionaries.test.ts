import { describe, expect, it } from "vitest";
import { locales } from "../config";
import { dictionaries } from "./index";

function leafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafValues(value: unknown): unknown[] {
  if (typeof value !== "object" || value === null) return [value];
  return Object.values(value).flatMap(leafValues);
}

describe("dictionaries", () => {
  const reference = leafPaths(dictionaries.fr).sort();

  it.each(locales)("%s has exactly the same keys as French", (locale) => {
    expect(leafPaths(dictionaries[locale]).sort()).toEqual(reference);
  });

  it.each(locales)("%s has no empty strings", (locale) => {
    for (const value of leafValues(dictionaries[locale])) {
      expect(typeof value).toBe("string");
      expect((value as string).trim()).not.toBe("");
    }
  });

  it("uses the requested French hero copy", () => {
    expect(dictionaries.fr.hero.title).toBe("Construire les infrastructures de demain.");
    expect(dictionaries.fr.hero.primaryCta).toBe("Découvrir nos projets");
    expect(dictionaries.fr.hero.secondaryCta).toBe("Parlons de votre projet");
  });
});
