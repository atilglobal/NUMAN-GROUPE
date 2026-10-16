"use client";

import { useSyncExternalStore } from "react";
import type { ResolvedImage } from "@/content/types";
import { MediaFrame } from "@/components/ui/MediaFrame";

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function subscribe(onChange: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wide = window.matchMedia("(min-width: 1024px)");
  motion.addEventListener("change", onChange);
  wide.addEventListener("change", onChange);
  return () => {
    motion.removeEventListener("change", onChange);
    wide.removeEventListener("change", onChange);
  };
}

function shouldPlayVideo() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(min-width: 1024px)").matches;
}

export function HeroVisual({ image, videoUrl }: { image: ResolvedImage | null; videoUrl: string | null }) {
  const source = videoUrl && isDirectVideo(videoUrl) ? videoUrl : null;
  const playVideo = useSyncExternalStore(subscribe, shouldPlayVideo, () => false);

  if (playVideo && source) {
    return (
      <video
        className="h-full w-full object-cover object-[62%_70%] lg:object-[68%_center]"
        src={source}
        poster={image?.src}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
    );
  }

  return (
    <MediaFrame
      image={image}
      profile="desktopHero"
      sizes="100vw"
      preload
      className="h-full"
      imageClassName="object-[62%_70%] lg:object-[68%_center]"
    />
  );
}
