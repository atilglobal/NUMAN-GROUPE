export function isTrustedSetupOrigin(headers: Pick<Headers, "get">): boolean {
  const origin = headers.get("origin");
  const forwarded = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || headers.get("host") || "";
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
