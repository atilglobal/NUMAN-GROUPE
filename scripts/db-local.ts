import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import EmbeddedPostgres from "embedded-postgres";

/*
 * Development-only PostgreSQL server (no Docker or system install needed).
 * Credentials, port and database name come from DATABASE_URL in .env.local;
 * data is kept in .data/postgres. Stop with Ctrl+C.
 */

loadEnvConfig(process.cwd());

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const url = new URL(raw);
if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
  console.error(`DATABASE_URL points to ${url.hostname}; the local server only serves localhost.`);
  process.exit(1);
}

const database = decodeURIComponent(url.pathname.slice(1));
const databaseDir = path.join(process.cwd(), ".data", "postgres");

const server = new EmbeddedPostgres({
  databaseDir,
  port: Number(url.port || 5432),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  persistent: true,
  // initdb rejects OS locale names with non-ASCII characters (e.g. "Turkish_Türkiye.1254").
  initdbFlags: ["--locale=C", "--encoding=UTF8"],
  onLog: () => {},
});

async function main() {
  if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
    console.log(`Initialising a new cluster in ${databaseDir}…`);
    await server.initialise();
  }

  await server.start();

  const client = server.getPgClient("postgres", "localhost");
  await client.connect();
  const { rowCount } = await client.query("select 1 from pg_database where datname = $1", [database]);
  await client.end();
  if (!rowCount) {
    await server.createDatabase(database);
    console.log(`Created database "${database}".`);
  }

  console.log(
    `PostgreSQL is listening on localhost:${url.port || 5432} (database "${database}"). Ctrl+C to stop.`,
  );

  const shutdown = async () => {
    await server.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
