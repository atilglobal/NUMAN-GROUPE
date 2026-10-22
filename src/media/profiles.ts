export const mediaProfileIds = [
  "desktopHero",
  "mobileHero",
  "pageBanner",
  "projectCard",
  "visitCard",
  "visitPhoto",
  "teamPortrait",
  "galleryThumb",
  "galleryDetail",
  "logo",
] as const;

export type MediaProfileId = (typeof mediaProfileIds)[number];

export type MediaFit = "cover" | "contain" | "inside";

export type MediaProfile = {
  id: MediaProfileId;
  /** Display aspect (width / height) used for cover crops. */
  aspect: number;
  /** Output widths actually produced. Keep the list short. */
  widths: number[];
  fit: MediaFit;
  /** Warn in the panel when the shortest side is below this. */
  minShortSide: number;
  sizes: string;
};

export const mediaProfiles: Record<MediaProfileId, MediaProfile> = {
  desktopHero: {
    id: "desktopHero",
    aspect: 16 / 9,
    widths: [1280, 1920],
    fit: "cover",
    minShortSide: 720,
    sizes: "100vw",
  },
  mobileHero: {
    id: "mobileHero",
    aspect: 4 / 5,
    widths: [640, 960],
    fit: "cover",
    minShortSide: 640,
    sizes: "100vw",
  },
  pageBanner: {
    id: "pageBanner",
    aspect: 21 / 9,
    widths: [960, 1600],
    fit: "cover",
    minShortSide: 480,
    sizes: "100vw",
  },
  projectCard: {
    id: "projectCard",
    aspect: 4 / 3,
    widths: [480, 800],
    fit: "cover",
    minShortSide: 360,
    sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  },
  visitCard: {
    id: "visitCard",
    aspect: 3 / 2,
    widths: [800, 1280],
    fit: "inside",
    minShortSide: 480,
    sizes: "(min-width: 1024px) 60vw, 100vw",
  },
  visitPhoto: {
    id: "visitPhoto",
    aspect: 3 / 2,
    widths: [960, 1600, 2400],
    fit: "inside",
    minShortSide: 640,
    sizes: "(min-width: 1280px) 1200px, 100vw",
  },
  teamPortrait: {
    id: "teamPortrait",
    aspect: 4 / 5,
    widths: [320, 640, 960],
    fit: "contain",
    minShortSide: 240,
    sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  },
  galleryThumb: {
    id: "galleryThumb",
    aspect: 1,
    widths: [320, 480],
    fit: "cover",
    minShortSide: 240,
    sizes: "(min-width: 768px) 25vw, 50vw",
  },
  galleryDetail: {
    id: "galleryDetail",
    aspect: 3 / 2,
    widths: [960, 1600],
    fit: "inside",
    minShortSide: 640,
    sizes: "100vw",
  },
  logo: {
    id: "logo",
    aspect: 3,
    widths: [160, 320],
    fit: "contain",
    minShortSide: 64,
    sizes: "160px",
  },
};

export function isMediaProfileId(value: string): value is MediaProfileId {
  return (mediaProfileIds as readonly string[]).includes(value);
}

export function resolutionWarning(
  width: number | null,
  height: number | null,
  profile: MediaProfileId,
): string | null {
  if (!width || !height) return "Piksel boyutu okunamadı; kırpma kalitesi belirsiz.";
  const short = Math.min(width, height);
  const need = mediaProfiles[profile].minShortSide;
  if (short < need) {
    return `Bu görsel ${width}×${height} px. ${profile} alanı için kısa kenarın en az ${need} px olması önerilir; büyütme yapılmaz.`;
  }
  return null;
}
