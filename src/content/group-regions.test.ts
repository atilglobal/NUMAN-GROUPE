import { describe, expect, it } from "vitest";
import { regionColumns } from "./group-regions";

describe("regionColumns", () => {
  it("keeps three regional headings from the CMS body", () => {
    const columns = regionColumns(`## Afrique
Texte Afrique.

## Asie
Texte Asie.

## Europe
Texte Europe.`);
    expect(columns.map((item) => item.title)).toEqual(["Afrique", "Asie", "Europe"]);
    expect(columns[0]?.body).toBe("Texte Afrique.");
  });

  it("does not invent regions when headings are missing", () => {
    expect(regionColumns("Un seul paragraphe.")).toEqual([]);
  });
});
