import { describe, expect, it } from "vitest";
import { normalizePanelLogin } from "./login-id";

describe("normalizePanelLogin", () => {
  it("keeps a real address and turns a username into an internal address", () => {
    expect(normalizePanelLogin(" Admin@Example.ORG ")).toBe("admin@example.org");
    expect(normalizePanelLogin("admin")).toBe("admin@panel.local");
  });
});
