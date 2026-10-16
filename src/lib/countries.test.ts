import { describe, expect, it } from "vitest";
import { locales } from "@/i18n/config";
import { countryOptions, regionCodes } from "./countries";

describe("countryOptions", () => {
  it("keeps current Germany and omits withdrawn East Germany", () => {
    const codes = regionCodes();
    expect(codes).toContain("DE");
    expect(codes).not.toContain("DD");
    expect(codes).toContain("GB");
    expect(codes).not.toContain("UK");
  });

  it.each(locales)("has unique values and labels in %s", (locale) => {
    const options = countryOptions(locale);
    const values = options.map((item) => item.value);
    const labels = options.map((item) => item.label);
    expect(new Set(values).size).toBe(values.length);
    expect(new Set(labels).size).toBe(labels.length);
    expect(options.length).toBeGreaterThan(100);
  });
});
