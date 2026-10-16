import { describe, expect, it } from "vitest";
import { isObjectStorageConfigured } from "./object-store";

describe("isObjectStorageConfigured", () => {
  it("requires bucket and both keys", () => {
    expect(isObjectStorageConfigured({})).toBe(false);
    expect(
      isObjectStorageConfigured({
        MEDIA_S3_BUCKET: "numan-media",
        MEDIA_S3_ACCESS_KEY_ID: "id",
        MEDIA_S3_SECRET_ACCESS_KEY: "secret",
      }),
    ).toBe(true);
  });
});
