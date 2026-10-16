import { clearDemo, seedDemo } from "../src/db/seed/run";
import { withDb } from "./with-db";

const clearOnly = process.argv.includes("--clear");

void withDb(async (db) => {
  if (clearOnly) {
    await clearDemo(db);
    console.log("Demo content removed.");
    return;
  }
  await seedDemo(db);
  console.log("Demo content seeded (every row flagged isDemo).");
});
