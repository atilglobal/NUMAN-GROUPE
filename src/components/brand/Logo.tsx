import Image from "next/image";
import Link from "next/link";
import type { ResolvedImage } from "@/content/types";
import { derivedMediaPath } from "@/media/url";
import { cn } from "@/components/ui/cn";

type LogoProps = {
  href: string;
  homeLabel: string;
  placeholderLabel: string;
  tone?: "light" | "dark";
  image?: ResolvedImage | null;
};

export function Logo({ href, homeLabel, placeholderLabel, tone = "light", image }: LogoProps) {
  const dark = tone === "dark";
  return (
    <Link href={href} aria-label={homeLabel} className="inline-flex items-center gap-3">
      {image ? (
        <Image
          src={
            image.assetId
              ? derivedMediaPath(image.assetId, "logo", 320, image.focalX ?? 0.5, image.focalY ?? 0.5)
              : image.src
          }
          alt={image.alt}
          width={image.width ?? 176}
          height={image.height ?? 44}
          className="h-11 w-auto max-w-[11rem] object-contain"
        />
      ) : (
        <>
          <span
            role="img"
            aria-label={placeholderLabel}
            title={placeholderLabel}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full border border-dashed text-[0.5625rem] font-semibold uppercase tracking-[0.12em]",
              dark ? "border-gold-300 text-gold-300" : "border-navy-800 text-navy-800",
            )}
          >
            Logo
          </span>
          <span
            className={cn(
              "font-serif text-[1.0625rem] font-semibold uppercase leading-[1.05] tracking-[0.08em]",
              dark ? "text-paper" : "text-navy-950",
            )}
          >
            Numan
            <br />
            Groupe
          </span>
        </>
      )}
    </Link>
  );
}
