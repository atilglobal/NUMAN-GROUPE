import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseRichText, RichText, safeHref } from "./rich-text";

const html = (source: string) => renderToStaticMarkup(<RichText source={source} />);

describe("RichText", () => {
  it("renders the supported subset", () => {
    const output = html(
      "## Title\n\nFirst **bold** and *italic* line\nsecond line\n\n- one\n- two\n\n1. first\n2. second\n\n### Sub\n[Site](https://example.org/a?b=1)",
    );
    expect(output).toContain("<h2");
    expect(output).toContain("<h3");
    expect(output).toContain("<strong>bold</strong>");
    expect(output).toContain("<em>italic</em>");
    expect(output).toMatch(/<ul[^>]*><li>one<\/li><li>two<\/li><\/ul>/);
    expect(output).toMatch(/<ol[^>]*><li>first<\/li>/);
    expect(output).toContain('href="https://example.org/a?b=1"');
    expect(output).toContain('rel="noopener noreferrer nofollow"');
  });

  it("shows raw HTML as text instead of interpreting it", () => {
    const output = html('<script>alert(1)</script>\n\n<img src=x onerror="alert(2)">');
    expect(output).not.toContain("<script");
    expect(output).not.toContain("<img");
    expect(output).toContain("&lt;script&gt;");
  });

  it("never turns unsafe URLs into links", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,x", "http://example.org", "//evil.example", "/relative"]) {
      const output = html(`[click](${url})`);
      expect(output).not.toContain("<a");
      expect(output).toContain("click");
    }
  });

  it("does not let link labels or emphasis smuggle markup", () => {
    const output = html('[<b onclick="x">hi</b>](https://example.org) **<i>x</i>**');
    expect(output).not.toMatch(/<b |<i>/);
  });

  it("renders nothing for empty input", () => {
    expect(parseRichText("  \n\n ")).toEqual([]);
    expect(html("")).toBe("");
  });

  it("accepts only absolute https URLs", () => {
    expect(safeHref("https://example.org")).toBe("https://example.org/");
    expect(safeHref("HTTPS://example.org/x")).toBe("https://example.org/x");
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("mailto:a@example.org")).toBeNull();
  });
});
