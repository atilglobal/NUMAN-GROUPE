import { seedBase } from "../src/db/seed/run";
import { withDb } from "./with-db";

void withDb(async (db) => {
  const { expertisesCreated } = await seedBase(db);
  console.log(`Base seed applied (${expertisesCreated} expertise(s) created, existing rows untouched).`);
});
