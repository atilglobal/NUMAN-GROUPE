export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type SniffedImage = { mime: string; width: number | null; height: number | null };

const EXECUTABLE_HINTS = [
  [0x4d, 0x5a], // MZ (PE)
  [0x7f, 0x45, 0x4c, 0x46], // ELF
  [0x23, 0x21], // shebang
  [0xca, 0xfe, 0xba, 0xbe], // Mach-O fat
  [0xcf, 0xfa, 0xed, 0xfe], // Mach-O
];

function startsWith(buffer: Buffer, bytes: number[]) {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

export function looksExecutable(buffer: Buffer): boolean {
  return EXECUTABLE_HINTS.some((hint) => startsWith(buffer, hint));
}

export function looksLikeSvg(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 256).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  return head.startsWith("<svg") || head.includes("<svg") || /^<\?xml/i.test(head);
}

export function sniffImage(buffer: Buffer): SniffedImage | null {
  if (buffer.length < 12) return null;
  if (looksExecutable(buffer) || looksLikeSvg(buffer)) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ...jpegSize(buffer) };
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    if (buffer.length < 24) return { mime: "image/png", width: null, height: null };
    return { mime: "image/png", width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { mime: "image/webp", ...webpSize(buffer) };
  }
  if (buffer.toString("ascii", 0, 3) === "GIF") {
    return { mime: "image/gif", width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }
  return null;
}

function jpegSize(buffer: Buffer): { width: number | null; height: number | null } {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const size = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + size;
  }
  return { width: null, height: null };
}

function webpSize(buffer: Buffer): { width: number | null; height: number | null } {
  if (buffer.length < 30) return { width: null, height: null };
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  if (chunk === "VP8 " && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: null, height: null };
}
