import { describe, expect, it } from "vitest";
import { clientIpFrom } from "./client-ip";
import { can, permissions } from "./permissions";

describe("role permissions", () => {
  it("gives administrators every permission", () => {
    for (const permission of permissions) expect(can("admin", permission)).toBe(true);
  });

  it("limits editors to content and media", () => {
    expect(can("editor", "content:write")).toBe(true);
    expect(can("editor", "media:write")).toBe(true);
    expect(can("editor", "users:manage")).toBe(false);
    expect(can("editor", "settings:manage")).toBe(false);
    expect(can("editor", "inquiries:read")).toBe(false);
    expect(can("editor", "audit:read")).toBe(false);
  });
});

describe("clientIpFrom", () => {
  const headers = new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.7", "x-real-ip": "198.51.100.2" });

  it("trusts no header unless one is configured", () => {
    expect(clientIpFrom(headers, undefined)).toBeNull();
    expect(clientIpFrom(headers, "")).toBeNull();
  });

  it("uses the proxy-appended (rightmost) entry of a list header", () => {
    expect(clientIpFrom(headers, "X-Forwarded-For")).toBe("203.0.113.7");
    expect(clientIpFrom(headers, "x-real-ip")).toBe("198.51.100.2");
  });

  it("ignores values that are not IP addresses", () => {
    expect(clientIpFrom(new Headers({ "x-real-ip": "<script>" }), "x-real-ip")).toBeNull();
  });
});
