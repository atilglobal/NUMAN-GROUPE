import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { ensureDerivative } from "@/media/derivatives";
import { isMediaProfileId } from "@/media/profiles";
import { MediaProcessError } from "@/media/process";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ assetId: string; profile: string; width: string; fx: string; fy: string }>;
  },
) {
  const { assetId, profile, width, fx, fy } = await context.params;
  if (!isMediaProfileId(profile)) return new NextResponse("Not found", { status: 404 });
  const w = Number(width);
  const focalX = Number(fx) / 1000;
  const focalY = Number(fy) / 1000;
  if (!Number.isFinite(w) || !Number.isFinite(focalX) || !Number.isFinite(focalY)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const result = await ensureDerivative(getDb(), {
      assetId,
      profile,
      width: w,
      focalX,
      focalY,
    });
    if (!result) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(Uint8Array.from(result.bytes), {
      headers: {
        "Content-Type": result.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof MediaProcessError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }
}
