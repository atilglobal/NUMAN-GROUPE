import { describe, expect, it } from "vitest";
import { documentHtmlProps, googleNoTranslateMeta } from "./document";

describe("document language and translate hints", () => {
  it("keeps each public locale distinct and opts out of machine translation", () => {
    expect(documentHtmlProps("fr", "h-full")).toEqual({
      lang: "fr",
      translate: "no",
      className: "h-full notranslate",
    });
    expect(documentHtmlProps("en", "h-full").lang).toBe("en");
    expect(documentHtmlProps("tr", "h-full").lang).toBe("tr");
    expect(googleNoTranslateMeta.google).toBe("notranslate");
  });
});
