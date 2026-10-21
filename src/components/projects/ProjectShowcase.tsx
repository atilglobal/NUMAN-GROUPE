"use client";

import type { ReactNode } from "react";
import {
  displayProjectCover,
  projectGalleryThumbs,
  projectLightboxImages,
} from "@/content/project-gallery";
import type { ResolvedImage } from "@/content/types";
import { PROJECT_GALLERY_PREVIEW } from "@/media/gallery-limits";
import { GalleryLightbox, type GalleryLabels } from "@/components/detail/GalleryLightbox";

/** Cover, then children (about), then the thumbnail gallery — one lightbox. */
export function ProjectShowcase({
  cover,
  gallery,
  labels,
  children,
}: {
  cover: ResolvedImage | null;
  gallery: ResolvedImage[];
  labels: GalleryLabels & { heading: string };
  children: ReactNode;
}) {
  const shownCover = displayProjectCover(cover, gallery);
  const thumbs = projectGalleryThumbs(shownCover, gallery);
  const sequence = projectLightboxImages(shownCover, gallery);

  return (
    <GalleryLightbox
      images={sequence}
      thumbs={thumbs}
      cover={shownCover}
      afterCover={children}
      previewLimit={PROJECT_GALLERY_PREVIEW}
      heading={thumbs.length > 0 ? labels.heading : undefined}
      labels={{
        ...labels,
        count: thumbs.length > 0 ? labels.count : undefined,
      }}
    />
  );
}
