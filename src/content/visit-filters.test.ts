import { describe, expect, it } from "vitest";
import { parseVisitFilters, visitListHref } from "./visit-filters";

describe("visit list filters", () => {
  it("reads shareable query values and ignores unknowns", () => {
    expect(parseVisitFilters({ country: "sn", year: "2024", page: "2", extra: "nope" })).toEqual({
      country: "SN",
      year: 2024,
      page: 2,
    });
    expect(parseVisitFilters({ country: "FRA", year: "12", page: "0" })).toEqual({ page: 1 });
  });

  it("builds a stable public URL that keeps filters", () => {
    expect(visitListHref("fr", { country: "TR", year: 2023, page: 3 })).toBe(
      "/visites-institutionnelles?country=TR&year=2023&page=3",
    );
    expect(visitListHref("en", { page: 1 })).toBe("/en/institutional-visits");
  });
});
