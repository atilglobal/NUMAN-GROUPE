import { describe, expect, it } from "vitest";
import { mailtoHref, telHref, whatsappHref } from "./contact";

describe("contact links", () => {
  it("builds a wa.me URL only from a filled number", () => {
    expect(whatsappHref(null)).toBeNull();
    expect(whatsappHref("")).toBeNull();
    expect(whatsappHref("  ")).toBeNull();
    expect(whatsappHref("+90 555 123 4567")).toBe("https://wa.me/905551234567");
  });

  it("omits empty email and phone hrefs", () => {
    expect(mailtoHref(null)).toBeNull();
    expect(mailtoHref("")).toBeNull();
    expect(mailtoHref(" hello@example.com ")).toBe("mailto:hello@example.com");
    expect(telHref(null)).toBeNull();
    expect(telHref("+33 1 23")).toBe("tel:+33123");
  });
});
