"use client";

import Image from "next/image";
import { useState } from "react";

export function SafeMediaImage({
  src,
  alt,
  sizes,
  preload,
  className,
  objectPosition,
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
  objectPosition?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      fetchPriority={preload ? "high" : "auto"}
      decoding="async"
      className={className}
      style={objectPosition ? { objectPosition } : undefined}
      onError={() => setFailed(true)}
    />
  );
}
