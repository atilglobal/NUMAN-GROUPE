import { describe, expect, it } from "vitest";
import { ALFA_EXPECTED_PHOTO_FILES, ALFA_HQ_PHOTO, ALFA_VISITS, alfaAccountedPhotoFiles } from "./alfa-visits";
import { alfaTransferList } from "./import-alfa-visits";

describe("alfa visit catalog", () => {
  it("accounts for all 41 source photographs exactly once", () => {
    const accounted = alfaAccountedPhotoFiles();
    expect(accounted).toHaveLength(41);
    expect(new Set(accounted).size).toBe(41);
    expect([...accounted].sort()).toEqual([...ALFA_EXPECTED_PHOTO_FILES].sort());
  });

  it("keeps the Antalya headquarters photograph out of visit records", () => {
    expect(ALFA_VISITS.some((visit) => visit.photos.some((photo) => photo.file === ALFA_HQ_PHOTO.file))).toBe(false);
    expect(alfaTransferList().headquarters.classification).toContain("ziyaret değil");
  });

  it("leaves the unmatched Babalaye photograph unpublished", () => {
    const draft = ALFA_VISITS.find((visit) => visit.key === "babalaye-ndaou");
    expect(draft?.published).toBe(false);
    expect(draft?.countryCode).toBeNull();
    expect(draft?.photos.map((photo) => photo.file)).toEqual(["image40.jpeg"]);
  });

  it("does not invent visit dates", () => {
    expect(ALFA_VISITS.every((visit) => visit.photos.length > 0)).toBe(true);
    expect(new Set(ALFA_VISITS.map((visit) => visit.slug.fr)).size).toBe(ALFA_VISITS.length);
  });
});
