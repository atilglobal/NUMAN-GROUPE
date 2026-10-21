"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ResolvedImage } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { MediaFrame } from "@/components/ui/MediaFrame";

type Labels = {
  gallery: string;
  open: string;
  close: string;
  previous: string;
  next: string;
  of: string;
  demo: string;
};

type Props = {
  images: ResolvedImage[];
  labels: Labels;
};

export function GalleryLightbox({ images, labels }: Props) {
  const titleId = useId();
  const [index, setIndex] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  const open = index !== null;
  const current = index !== null ? images[index] : null;

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

  useEffect(() => {
    if (!open) return;
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

  if (images.length === 0) return null;

  return (
    <>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {images.map((image, imageIndex) => (
          <li key={image.assetId ?? `${image.src}-${imageIndex}`}>
            <figure>
              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setIndex(imageIndex)}
                aria-label={`${labels.open}: ${image.alt}`}
              >
                <MediaFrame
                  image={image}
                  profile="galleryThumb"
                  sizes="(min-width: 640px) 384px, 100vw"
                  className="aspect-[4/3]"
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
              <button type="button" className="min-h-10 rounded-md bg-paper px-4 text-sm text-navy-950" onClick={close}>
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
