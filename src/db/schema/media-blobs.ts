import { customType, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "./common";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/** Durable file bytes when S3 is not configured (Neon/Postgres). */
export const mediaBlobs = pgTable("media_blobs", {
  storageKey: text("storage_key").primaryKey(),
  bytes: bytea("bytes").notNull(),
  ...timestamps(),
});
