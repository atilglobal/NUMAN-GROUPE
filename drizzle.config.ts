import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { resolveDatabaseUrl } from "./src/db/url";

loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: resolveDatabaseUrl() ?? "" },
  strict: true,
  verbose: true,
});
