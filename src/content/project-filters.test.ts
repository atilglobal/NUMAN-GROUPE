import { describe, expect, it } from "vitest";
import { parseProjectFilters, projectListHref } from "./project-filters";

describe("project list filters", () => {
  it("reads status and page and ignores leftover country or expertise params", () => {
    expect(
      parseProjectFilters({
        status: "completed",
        expertise: "stades",
        country: "sn",
        page: "2",
        extra: "nope",
      }),
    ).toEqual({ status: "completed", page: 2 });

    expect(parseProjectFilters({ status: "planned", country: "FRA", page: "0" })).toEqual({
      status: "planned",
      page: 1,
    });
    expect(parseProjectFilters({ status: "draft", country: "SN" })).toEqual({ page: 1 });
  });

  it("builds a public URL with only status and page", () => {
    expect(projectListHref("fr", { status: "in_progress", page: 3 })).toBe("/projets?status=in_progress&page=3");
    expect(projectListHref("tr", { page: 1 })).toBe("/tr/projeler");
    expect(projectListHref("en", { status: "planned" })).toBe("/en/projects?status=planned");
  });
});
