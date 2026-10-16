import { describe, expect, it } from "vitest";
import type { SiteChrome } from "@/content/types";
import { organizationJsonLd } from "./seo";

const emptyChrome = {
  companyName: null,
  contactEmail: null,
  contactPhone: null,
  postalAddress: null,
  whatsapp: null,
  socialLinks: [],
  logo: null,
  faviconSrc: null,
  copy: null,
  homeVisuals: { hero: null, callToAction: null, heroVideoUrl: null },
  homeLayout: [],
} as unknown as SiteChrome;

describe("organizationJsonLd", () => {
  it("does not invent address, email or social profiles", () => {
    const data = organizationJsonLd(emptyChrome);
    expect(data).toMatchObject({ "@type": "Organization", name: "NUMAN GROUPE" });
    expect(data).not.toHaveProperty("email");
    expect(data).not.toHaveProperty("telephone");
    expect(data).not.toHaveProperty("address");
    expect(data).not.toHaveProperty("sameAs");
  });

  it("includes only configured contact fields", () => {
    const data = organizationJsonLd({
      ...emptyChrome,
      companyName: "NUMAN GROUPE",
      contactEmail: "bureau@example.org",
      socialLinks: [{ label: "LinkedIn", url: "https://www.linkedin.com/company/example" }],
    });
    expect(data?.email).toBe("bureau@example.org");
    expect(data?.sameAs).toEqual(["https://www.linkedin.com/company/example"]);
    expect(data).not.toHaveProperty("address");
  });
});
