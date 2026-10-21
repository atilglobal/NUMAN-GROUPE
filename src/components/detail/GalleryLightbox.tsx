"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { galleryNeedsToggle, visibleGalleryThumbs } from "@/content/project-gallery";
import type { ResolvedImage } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { MediaFrame } from "@/components/ui/MediaFrame";

export type GalleryLabels = {
  gallery: string;
  open: string;
  close: string;
  previous: string;
  next: string;
  of: string;
  demo: string;
  showAll?: string;
  showLess?: string;
  count?: string;
};

type Props = {
  images: ResolvedImage[];
  thumbs?: ResolvedImage[];
  cover?: ResolvedImage | null;
  afterCover?: ReactNode;
  labels: GalleryLabels;
  previewLimit?: number;
  heading?: string;
};

export function GalleryLightbox({
  images,
  thumbs = images,
  cover,
  afterCover,
  labels,
  previewLimit,
  heading,
}: Props) {
  const titleId = useId();
  const [index, setIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const touchStart = useRef<number | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const current = index !== null ? images[index] : null;
  const shown = previewLimit != null ? visibleGalleryThumbs(thumbs, expanded, previewLimit) : thumbs;
  const toggle = previewLimit != null && galleryNeedsToggle(thumbs.length, previewLimit);

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (delta: number) => {
      setIndex((currentIndex) => {
        if (currentIndex === null || images.length === 0) return currentIndex;
        return (currentIndex + delta + images.length) % images.length;
      });
    },
    [images.length],
  );

  function openImage(image: ResolvedImage) {
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const at = images.findIndex((item) => (item.assetId ?? item.src) === (image.assetId ?? image.src));
    setIndex(at >= 0 ? at : 0);
  }

  useEffect(() => {
    if (!open) {
      restoreFocus.current?.focus();
      restoreFocus.current = null;
      return;
    }
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, go]);

  if (images.length === 0 && thumbs.length === 0 && !cover) return null;

  return (
    <>
      {cover ? (
        <figure className="mb-14 lg:mb-16">
          <button
            type="button"
            className="relative block w-full text-left"
            onClick={() => openImage(cover)}
            aria-label={`${labels.open}: ${cover.alt}`}
          >
            <MediaFrame
              image={cover}
              sizes="(min-width: 1280px) 1200px, 100vw"
              preload
              className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]"
            >
              {cover.isDemo ? <DemoBadge label={labels.demo} className="absolute right-3 top-3" /> : null}
            </MediaFrame>
          </button>
          {cover.caption ? <figcaption className="mt-3 text-sm text-muted">{cover.caption}</figcaption> : null}
        </figure>
      ) : null}

      {afterCover}

      {thumbs.length > 0 ? (
        <section aria-labelledby={heading ? "project-gallery" : undefined} className={previewLimit != null ? "border-t border-line pt-12" : undefined}>
          {heading || labels.count ? (
            <div className="flex flex-wrap items-end justify-between gap-3">
              {heading ? (
                <h2 id="project-gallery" className="font-serif text-3xl text-navy-950 sm:text-4xl">
                  {heading}
                </h2>
              ) : null}
              {labels.count ? (
                <p className="text-sm text-muted">{labels.count.replace("{count}", String(thumbs.length))}</p>
              ) : null}
            </div>
          ) : null}

          <ul
            className={
              previewLimit != null
                ? "mt-6 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 lg:grid-cols-3 lg:gap-4"
                : "mt-4 grid gap-4 sm:grid-cols-2"
            }
          >
            {shown.map((image, imageIndex) => (
              <li key={image.assetId ?? `${image.src}-${imageIndex}`}>
                <figure>
                  <button
                    type="button"
                    className="relative block w-full text-left"
                    onClick={() => openImage(image)}
                    aria-label={`${labels.open}: ${image.alt}`}
                  >
                    <MediaFrame
                      image={image}
                      profile="galleryThumb"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="aspect-[4/3] bg-navy-800"
                    >
                      {image.isDemo ? (
                        <DemoBadge label={labels.demo} className="absolute right-3 top-3" />
                      ) : null}
                    </MediaFrame>
                  </button>
                  {image.caption ? <figcaption className="mt-2 text-sm text-muted">{image.caption}</figcaption> : null}
                </figure>
              </li>
            ))}
          </ul>

          {toggle ? (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex min-h-12 items-center border border-navy-900 px-6 text-[0.9375rem] font-medium text-navy-900 hover:bg-navy-900 hover:text-paper"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded
                  ? (labels.showLess ?? "")
                  : (labels.showAll ?? "").replace("{count}", String(thumbs.length))}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {open && current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4"
          onClick={close}
        >
          <div
            className="relative flex h-full w-full max-w-5xl flex-col"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchStart.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current;
              const end = event.changedTouches[0]?.clientX;
              touchStart.current = null;
              if (start == null || end == null) return;
              const delta = end - start;
              if (Math.abs(delta) < 40) return;
              go(delta > 0 ? -1 : 1);
            }}
          >
            <p id={titleId} className="sr-only">
              {labels.gallery}
            </p>
            <div className="relative min-h-0 flex-1">
              <MediaFrame
                image={current}
                sizes="100vw"
                className="h-full min-h-[50vh] bg-transparent"
                imageClassName="object-contain"
              />
            </div>
            {current.caption ? <p className="mt-3 text-center text-sm text-paper">{current.caption}</p> : null}
            <p className="mt-2 text-center text-xs text-paper/70">
              {labels.of.replace("{current}", String((index ?? 0) + 1)).replace("{total}", String(images.length))}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button type="button" className="min-h-10 rounded-md bg-paper px-4 text-sm text-navy-950" onClick={() => go(-1)}>
                {labels.previous}
              </button>
              <button
                ref={closeRef}
                type="button"
                className="min-h-10 rounded-md bg-paper px-4 text-sm text-navy-950"
                onClick={close}
              >
                {labels.close}
              </button>
              <button type="button" className="min-h-10 rounded-md bg-paper px-4 text-sm text-navy-950" onClick={() => go(1)}>
                {labels.next}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
