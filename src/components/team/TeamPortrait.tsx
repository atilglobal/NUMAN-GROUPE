import type { ResolvedImage } from "@/content/types";
import { cn } from "@/components/ui/cn";

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Cover when the file is close to 4:5; otherwise contain so faces are not cropped. */
export function teamPortraitFit(photo: ResolvedImage): "cover" | "contain" {
  if (!photo.width || !photo.height) return "contain";
  const ratio = photo.width / photo.height;
  if (ratio > 0.92 || ratio < 0.68) return "contain";
  return "cover";
}

export function TeamPortrait({
  name,
  photo,
  sizes,
  className,
}: {
  name: string;
  photo: ResolvedImage | null;
  sizes: string;
  className?: string;
}) {
  if (!photo) {
    return (
      <div
        className={cn("grid aspect-[4/5] w-full place-items-center bg-paper-2 text-gold-700", className)}
        aria-hidden="true"
      >
        <span className="font-serif text-2xl tracking-wide">{initials(name)}</span>
      </div>
    );
  }

  const fit = teamPortraitFit(photo);
  const ratio = photo.width && photo.height ? photo.width / photo.height : 0.8;
  const position =
    photo.focalX != null && photo.focalY != null
      ? `${photo.focalX * 100}% ${photo.focalY * 100}%`
      : fit === "cover" && ratio < 0.78
        ? "50% 18%"
        : "50% 50%";

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden bg-paper-2", className)}>
      {/* native img: original bytes; frame ratio is CSS, not the file’s intrinsic size. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width ?? 640}
        height={photo.height ?? 800}
        sizes={sizes}
        decoding="async"
        className={cn("absolute inset-0 block size-full", fit === "cover" ? "object-cover" : "object-contain")}
        style={{ objectPosition: position }}
      />
    </div>
  );
}
