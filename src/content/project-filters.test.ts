import { describe, expect, it } from "vitest";
import { parseProjectFilters, projectListHref } from "./project-filters";

describe("project list filters", () => {
  it("reads shareable query values and ignores unknowns", () => {
    expect(
      parseProjectFilters({
        status: "completed",
        expertise: "stades",
        country: "sn",
        page: "2",
        extra: "nope",
      }),
    ).toEqual({ status: "completed", expertiseSlug: "stades", country: "SN", page: 2 });

    expect(parseProjectFilters({ status: "draft", country: "FRA", page: "0" })).toEqual({ page: 1 });
  });

  it("builds a stable public URL that keeps filters", () => {
    expect(
      projectListHref("fr", { status: "in_progress", expertiseSlug: "hopitaux", country: "TR", page: 3 }),
    ).toBe("/projets?status=in_progress&expertise=hopitaux&country=TR&page=3");
    expect(projectListHref("tr", { page: 1 })).toBe("/tr/projeler");
  });
});
