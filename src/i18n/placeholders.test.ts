import { describe, expect, it } from "vitest";
import { interpolate, placeholderNames, placeholdersMatch } from "./placeholders";

describe("UI placeholders", () => {
  it("extracts brace tokens", () => {
    expect(placeholderNames("Page {page} sur {total}")).toEqual(["page", "total"]);
  });

  it("rejects a translation that drops or invents tokens", () => {
    expect(placeholdersMatch("Page {page} sur {total}", "Sayfa {page} / {total}")).toBe(true);
    expect(placeholdersMatch("Page {page} sur {total}", "Sayfa {page}")).toBe(false);
    expect(placeholdersMatch("Hello {name}", "Hello {count}")).toBe(false);
  });

  it("formats numbers with the active locale", () => {
    expect(interpolate("{count} projets", { count: 1200 }, "fr")).toMatch(/1[\s\u00a0]?200/);
  });
});
