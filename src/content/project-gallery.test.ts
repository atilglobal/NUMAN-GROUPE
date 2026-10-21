import { describe, expect, it } from "vitest";
import {
  displayProjectCover,
  galleryNeedsToggle,
  projectGalleryThumbs,
  projectLightboxImages,
  visibleGalleryThumbs,
} from "./project-gallery";
import type { ResolvedImage } from "./types";

function img(id: string): ResolvedImage {
  return { src: `/m/${id}`, alt: id, caption: null, isDemo: false, assetId: id, width: 800, height: 600 };
}

describe("project gallery presentation", () => {
  it("uses the first gallery image only as a fallback cover", () => {
    const gallery = [img("a"), img("b")];
    expect(displayProjectCover(null, gallery)?.assetId).toBe("a");
    expect(displayProjectCover(img("cover"), gallery)?.assetId).toBe("cover");
    expect(displayProjectCover(null, [])).toBeNull();
  });

  it("dedupes the cover in lightbox and thumbs without dropping gallery data", () => {
    const cover = img("a");
    const gallery = [img("a"), img("b"), img("c")];
    expect(projectLightboxImages(cover, gallery).map((item) => item.assetId)).toEqual(["a", "b", "c"]);
    expect(projectGalleryThumbs(cover, gallery).map((item) => item.assetId)).toEqual(["b", "c"]);
    expect(gallery.map((item) => item.assetId)).toEqual(["a", "b", "c"]);
  });

  it("shows 6 thumbs until expanded, and hides the toggle at 6 or fewer", () => {
    const thumbs = Array.from({ length: 7 }, (_, index) => img(String(index)));
    expect(visibleGalleryThumbs(thumbs, false)).toHaveLength(6);
    expect(visibleGalleryThumbs(thumbs, true)).toHaveLength(7);
    expect(galleryNeedsToggle(0)).toBe(false);
    expect(galleryNeedsToggle(1)).toBe(false);
    expect(galleryNeedsToggle(6)).toBe(false);
    expect(galleryNeedsToggle(7)).toBe(true);
    expect(galleryNeedsToggle(100)).toBe(true);
  });
});
