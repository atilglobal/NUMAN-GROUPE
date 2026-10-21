import { PROJECT_GALLERY_PREVIEW } from "@/media/gallery-limits";
import type { ResolvedImage } from "./types";

function imageKey(image: ResolvedImage): string {
  return image.assetId ?? image.src;
}

/** Cover for display only: stored cover, else first gallery image. Does not write the DB. */
export function displayProjectCover(cover: ResolvedImage | null, gallery: ResolvedImage[]): ResolvedImage | null {
  return cover ?? gallery[0] ?? null;
}

/** Lightbox order: cover first, then gallery, without repeating the same file. */
export function projectLightboxImages(cover: ResolvedImage | null, gallery: ResolvedImage[]): ResolvedImage[] {
  const seen = new Set<string>();
  const out: ResolvedImage[] = [];
  for (const image of cover ? [cover, ...gallery] : gallery) {
    const key = imageKey(image);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(image);
  }
  return out;
}

/** Grid thumbs skip the file already used as the large cover. Gallery rows stay in storage. */
export function projectGalleryThumbs(cover: ResolvedImage | null, gallery: ResolvedImage[]): ResolvedImage[] {
  const coverKey = cover ? imageKey(cover) : null;
  return gallery.filter((image) => imageKey(image) !== coverKey);
}

export function visibleGalleryThumbs<T>(thumbs: T[], expanded: boolean, limit = PROJECT_GALLERY_PREVIEW): T[] {
  if (expanded || thumbs.length <= limit) return thumbs;
  return thumbs.slice(0, limit);
}

export function galleryNeedsToggle(count: number, limit = PROJECT_GALLERY_PREVIEW): boolean {
  return count > limit;
}
