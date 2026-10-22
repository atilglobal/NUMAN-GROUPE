import type { ResolvedImage } from "@/content/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn } from "@/components/ui/cn";

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export function TeamPortrait({
  name,
  photo,
  sizes,
  compact = false,
  className,
}: {
  name: string;
  photo: ResolvedImage | null;
  sizes: string;
  compact?: boolean;
  className?: string;
}) {
  if (photo) {
    return (
      <MediaFrame
        image={photo}
        profile="teamPortrait"
        fit="contain"
        sizes={sizes}
        className={cn("aspect-[4/5] bg-navy-950", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center bg-navy-950 text-gold-400",
        compact ? "size-16 rounded-full" : "aspect-[4/5] w-full",
        className,
      )}
      aria-hidden="true"
    >
      <span className={cn("font-serif tracking-wide", compact ? "text-lg" : "text-3xl")}>{initials(name)}</span>
    </div>
  );
}
