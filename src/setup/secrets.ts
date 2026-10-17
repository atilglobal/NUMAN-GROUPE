import { timingSafeEqual } from "node:crypto";

export function setupKeysMatch(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    timingSafeEqual(right, right);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function redactSetupError(message: string, env: Record<string, string | undefined> = process.env): string {
  let next = message;
  const secrets = [env.SETUP_KEY, env.DATABASE_URL, env.POSTGRES_URL, env.POSTGRES_URL_NON_POOLING, env.BETTER_AUTH_SECRET, env.ADMIN_PASSWORD];
  for (const value of secrets) {
    if (value && value.length > 4) next = next.split(value).join("[redacted]");
  }
  return next.replace(/postgres(?:ql)?:\/\/[^\s)'"]+/gi, "[redacted]");
}
