import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(root);

const server = path.join(root, ".next", "standalone", "server.js");
const child = spawn(process.execPath, [server], {
  cwd: path.dirname(server),
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
