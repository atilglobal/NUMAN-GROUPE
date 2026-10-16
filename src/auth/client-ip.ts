import { isIP } from "node:net";

/**
 * Client IP from the header named in AUTH_IP_HEADER, set by the reverse proxy
 * in front of the app. Without that setting no IP is trusted (request headers
 * are client-controlled), and IP-based throttling is skipped. For a list
 * header such as x-forwarded-for the rightmost entry is used: it is the one
 * appended by the nearest proxy, earlier entries can be forged.
 */
export function clientIpFrom(
  headers: Pick<Headers, "get">,
  headerName: string | undefined = process.env.AUTH_IP_HEADER,
): string | null {
  if (!headerName) return null;
  const raw = headers.get(headerName.trim().toLowerCase());
  if (!raw) return null;
  const candidate = raw.split(",").at(-1)?.trim() ?? "";
  return isIP(candidate) ? candidate : null;
}
