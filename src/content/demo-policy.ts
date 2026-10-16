type DemoEnv = {
  SITE_ENV?: string;
  ALLOW_DEMO_CONTENT?: string;
  NODE_ENV?: string;
};

/**
 * Demo content never reaches a production site: `SITE_ENV=production` always
 * wins. Outside production it is on in development and off in production
 * builds unless `ALLOW_DEMO_CONTENT=true` (e.g. a staging preview).
 */
function liveEnv(env: DemoEnv): DemoEnv {
  const bag = env as Record<string, string | undefined>;
  return {
    SITE_ENV: bag["SITE_ENV"],
    ALLOW_DEMO_CONTENT: bag["ALLOW_DEMO_CONTENT"],
    NODE_ENV: bag["NODE_ENV"],
  };
}

export function isDemoContentEnabled(env: DemoEnv = process.env): boolean {
  const current = liveEnv(env);
  if (current.SITE_ENV === "production") return false;
  if (current.ALLOW_DEMO_CONTENT === "true") return true;
  if (current.ALLOW_DEMO_CONTENT === "false") return false;
  return current.NODE_ENV !== "production";
}
