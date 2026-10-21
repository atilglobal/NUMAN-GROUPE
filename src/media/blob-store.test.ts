import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import { createTestDb, truncateAll } from "@/db/testing";
import { deleteMediaBlob, putMediaBlob, readMediaBlob } from "./blob-store";
import { putObject, readObject } from "./storage";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

const key = "uploads/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee.jpg";

describe("postgres media blobs", () => {
  it("round-trips bytes without S3", async () => {
    const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    await putMediaBlob(db, key, bytes);
    expect(Buffer.from(await readMediaBlob(db, key) ?? [])).toEqual(bytes);
    await deleteMediaBlob(db, key);
    expect(await readMediaBlob(db, key)).toBeNull();
  });

  it("putObject uses the database when S3 is unset", async () => {
    const bytes = Buffer.from("image-bytes");
    await putObject(key, bytes, db);
    expect(Buffer.from((await readObject(key, db)) ?? [])).toEqual(bytes);
  });
});
