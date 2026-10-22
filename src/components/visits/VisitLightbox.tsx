"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ResolvedImage } from "@/content/types";
import { VisitPhoto } from "./VisitPhoto";

export type VisitLightboxLabels = {
  gallery: string;
  open: string;
  close: string;
  previous: string;
  next: string;
  of: string;
  zoomIn: string;
  zoomOut: string;
  demo: string;
  showAll?: string;
  showLess?: string;
};

type Props = {
  images: ResolvedImage[];
  labels: VisitLightboxLabels;
  demoLabel?: string;
  previewLimit?: number;
};

export function VisitLightbox({ images, labels, demoLabel, previewLimit = 4 }: Props) {
  const titleId = useId();
  const [index, setIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const current = index !== null ? images[index] : null;
  const shown = expanded || images.length <= previewLimit ? images : images.slice(0, previewLimit);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const close = useCallback(() => {
    setIndex(null);
    resetView();
  }, [resetView]);

  const go = useCallback(
    (delta: number) => {
      setIndex((currentIndex) => {
        if (currentIndex === null || images.length === 0) return currentIndex;
        return (currentIndex + delta + images.length) % images.length;
      });
      resetView();
    },
    [images.length, resetView],
  );

  function openImage(at: number) {
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIndex(at);
    resetView();
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

  if (images.length === 0) return null;

  const single = images.length === 1;

  return (
    <>
      {single ? (
        <button
          type="button"
          className="block w-full text-left"
          onClick={() => openImage(0)}
          aria-label={`${labels.open}: ${images[0]!.alt}`}
        >
          <VisitPhoto image={images[0]!} sizes="(min-width: 1280px) 1200px, 100vw" preload demoLabel={demoLabel} />
          {images[0]!.caption ? <p className="mt-3 text-sm text-muted">{images[0]!.caption}</p> : null}
        </button>
      ) : (
        <>
          <ul className="grid gap-8">
            {shown.map((image, imageIndex) => {
              const at = images.indexOf(image);
              return (
                <li key={image.assetId ?? `${image.src}-${imageIndex}`}>
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => openImage(at < 0 ? imageIndex : at)}
                    aria-label={`${labels.open}: ${image.alt}`}
                  >
                    <VisitPhoto
                      image={image}
                      sizes="(min-width: 1280px) 1200px, 100vw"
                      preload={imageIndex === 0}
                      demoLabel={demoLabel}
                    />
                  </button>
                  {image.caption ? <p className="mt-3 text-sm text-muted">{image.caption}</p> : null}
                </li>
              );
            })}
          </ul>
          {images.length > previewLimit ? (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex min-h-12 items-center border border-navy-900 px-6 text-sm font-medium text-navy-900 hover:bg-navy-900 hover:text-paper"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? labels.showLess : labels.showAll?.replace("{count}", String(images.length))}
              </button>
            </div>
          ) : null}
        </>
      )}

      {open && current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex flex-col bg-navy-950/95"
        >
          <p id={titleId} className="sr-only">
            {labels.gallery}
          </p>
          <div
            className="relative min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
            onWheel={(event) => {
              event.preventDefault();
              setScale((value) => Math.min(4, Math.max(1, value + (event.deltaY < 0 ? 0.2 : -0.2))));
            }}
            onPointerDown={(event) => {
              if (scale <= 1) return;
              drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              setOffset({
                x: drag.current.ox + event.clientX - drag.current.x,
                y: drag.current.oy + event.clientY - drag.current.y,
              });
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onTouchStart={(event) => {
              if (event.touches.length === 2) {
                const [a, b] = [event.touches[0]!, event.touches[1]!];
                pinch.current = {
                  distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
                  scale,
                };
              }
            }}
            onTouchMove={(event) => {
              if (event.touches.length === 2 && pinch.current) {
                const [a, b] = [event.touches[0]!, event.touches[1]!];
                const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                setScale(Math.min(4, Math.max(1, (pinch.current.scale * distance) / pinch.current.distance)));
              }
            }}
            onTouchEnd={(event) => {
              if (event.touches.length < 2) pinch.current = null;
            }}
            onDoubleClick={() => {
              setScale((value) => (value > 1 ? 1 : 2));
              setOffset({ x: 0, y: 0 });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.alt}
              width={current.width ?? undefined}
              height={current.height ?? undefined}
              className="h-full w-full object-contain"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: "center center" }}
              draggable={false}
            />
          </div>
          <div className="border-t border-paper/15 px-4 py-3 text-paper">
            {current.caption ? <p className="text-center text-sm">{current.caption}</p> : null}
            {current.width && current.height ? (
              <p className="mt-1 text-center text-xs text-paper/60">
                {current.width} × {current.height}
              </p>
            ) : null}
            <p className="mt-1 text-center text-xs text-paper/70">
              {labels.of.replace("{current}", String((index ?? 0) + 1)).replace("{total}", String(images.length))}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button type="button" className="min-h-10 rounded-md bg-paper px-4 text-sm text-navy-950" onClick={() => go(-1)}>
                {labels.previous}
              </button>
              <button
                type="button"
                className="min-h-10 rounded-md bg-paper px-4 text-sm text-navy-950"
                onClick={() => setScale((value) => Math.min(4, value + 0.5))}
              >
                {labels.zoomIn}
              </button>
              <button
                type="button"
                className="min-h-10 rounded-md bg-paper px-4 text-sm text-navy-950"
                onClick={() => {
                  setScale((value) => Math.max(1, value - 0.5));
                  if (scale <= 1.5) setOffset({ x: 0, y: 0 });
                }}
              >
                {labels.zoomOut}
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
