import type { ResolvedImage } from "@/content/types";
import { cn } from "@/components/ui/cn";
import { DemoBadge } from "@/components/ui/Badges";

type Props = {
  image: ResolvedImage;
  demoLabel?: string;
  sizes: string;
  preload?: boolean;
  className?: string;
};

/** Visit photos keep their native ratio. Cover crops are not applied. */
export function VisitPhoto({ image, demoLabel, sizes, preload, className }: Props) {
  const width = image.width && image.width > 0 ? image.width : 1600;
  const height = image.height && image.height > 0 ? image.height : 1067;

  return (
    <figure className={cn("relative flex w-full items-center justify-center bg-navy-950", className)}>
      {/* native img: original bytes, no cover crop. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        width={width}
        height={height}
        sizes={sizes}
        decoding="async"
        fetchPriority={preload ? "high" : "auto"}
        className="max-h-[min(70vh,44rem)] w-auto max-w-full object-contain"
      />
      {image.isDemo && demoLabel ? (
        <DemoBadge label={demoLabel} className="absolute right-3 top-3" />
      ) : null}
    </figure>
  );
}
