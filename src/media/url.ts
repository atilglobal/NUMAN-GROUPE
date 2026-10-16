/**
 * Public URL of a stored file. Uploads are served by GET /media/[...key]
 * from MEDIA_STORAGE_DIR. Demo bytes live under content/demo/ (not public/)
 * and are only served by GET /media/demo/... when demo content is enabled.
 * MEDIA_PUBLIC_BASE_URL points at a CDN when one exists.
 */
export function derivedMediaPath(
  assetId: string,
  profile: string,
  width: number,
  focalX: number,
  focalY: number,
): string {
  const fx = Math.round(Math.min(1, Math.max(0, focalX)) * 1000);
  const fy = Math.round(Math.min(1, Math.max(0, focalY)) * 1000);
  return `/media/v/${assetId}/${profile}/${width}/${fx}/${fy}`;
}

export function mediaUrl(storageKey: string): string {
  const base = (process.env.MEDIA_PUBLIC_BASE_URL ?? "/media").replace(/\/+$/, "");
  const key = storageKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/${key}`;
}
