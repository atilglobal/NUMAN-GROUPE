import { NextResponse } from "next/server";
import { isPublicMediaKey, readObject } from "@/media/storage";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const key = (await context.params).key.join("/");
  if (!isPublicMediaKey(key)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const bytes = await readObject(key);
  if (!bytes) return new NextResponse("Not found", { status: 404 });
  const ext = key.split(".").pop()?.toLowerCase() ?? "jpg";
  return new NextResponse(Uint8Array.from(bytes), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
