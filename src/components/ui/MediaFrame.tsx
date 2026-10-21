import Image from "next/image";
import type { ReactNode } from "react";
import type { ResolvedImage } from "@/content/types";
import { mediaProfiles, type MediaProfileId } from "@/media/profiles";
import { cn } from "./cn";

type MediaFrameProps = {
  image: ResolvedImage | null;
  sizes: string;
  className?: string;
  imageClassName?: string;
  preload?: boolean;
  profile?: MediaProfileId;
  children?: ReactNode;
};

/**
 * Image area with a neutral architectural fallback when no approved image
 * exists, so layouts keep their rhythm without inventing visuals.
 */
export function MediaFrame({
  image,
  sizes,
  className,
  imageClassName,
  preload,
  profile,
  children,
}: MediaFrameProps) {
  // Stored upload URL, not a derivative. Missing locale alt or a failed Sharp
  // variant must not hide a file that /media/uploads/... can already serve.
  const src = image?.src ?? null;
  const fit = profile ? mediaProfiles[profile].fit : "cover";
  const objectClass = fit === "contain" ? "object-contain" : fit === "inside" ? "object-contain" : "object-cover";

  return (
    <div className={cn("relative overflow-hidden bg-navy-800", className)}>
      {image && src ? (
        <Image
          src={src}
          alt={image.alt}
          fill
          sizes={profile ? mediaProfiles[profile].sizes : sizes}
          preload={preload}
          fetchPriority={preload ? "high" : "auto"}
          decoding="async"
          className={cn(objectClass, imageClassName)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
        />
      )}
      {children}
    </div>
  );
}
