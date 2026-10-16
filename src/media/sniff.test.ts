import { describe, expect, it } from "vitest";
import { looksExecutable, looksLikeSvg, sniffImage } from "./sniff";

function png(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  buffer[0] = 0x89;
  buffer[1] = 0x50;
  buffer[2] = 0x4e;
  buffer[3] = 0x47;
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

describe("media sniff", () => {
  it("reads PNG magic and dimensions, ignoring the filename", () => {
    expect(sniffImage(png(800, 600))).toEqual({ mime: "image/png", width: 800, height: 600 });
  });

  it("rejects SVG even when labelled as png", () => {
    const svg = Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(looksLikeSvg(svg)).toBe(true);
    expect(sniffImage(svg)).toBeNull();
  });

  it("rejects executables", () => {
    const pe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03]);
    expect(looksExecutable(pe)).toBe(true);
    expect(sniffImage(pe)).toBeNull();
  });
});
