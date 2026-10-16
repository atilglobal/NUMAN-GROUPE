import { loadEnvConfig } from "@next/env";
import { assessProductionEnv } from "../src/lib/production-env";

loadEnvConfig(process.cwd());

const assessment = assessProductionEnv(process.env);
const strict = process.argv.includes("--strict") || process.env.SITE_ENV === "production";

if (assessment.missing.length) {
  console.error("Missing required variables:");
  for (const name of assessment.missing) console.error(`  - ${name}`);
}
if (assessment.warnings.length) {
  console.error("Warnings:");
  for (const warning of assessment.warnings) console.error(`  - ${warning}`);
}

if (assessment.ready) {
  console.log("Production environment variables look complete. Hosting provider is still an operator decision.");
} else if (!strict) {
  console.log("Not a public-launch environment (expected for local development).");
}

if (strict && (assessment.missing.length > 0 || !assessment.ready)) {
  process.exit(1);
}
