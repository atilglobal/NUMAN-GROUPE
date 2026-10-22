import { describe, expect, it } from "vitest";
import { KADRO_ROSTER, matchKadroMember, normalizePersonName } from "./kadro-roster";

describe("kadro roster", () => {
  it("lists all eleven Word names exactly once and keeps the two existing people", () => {
    expect(KADRO_ROSTER).toHaveLength(11);
    expect(new Set(KADRO_ROSTER.map((member) => member.photo)).size).toBe(11);
    expect(KADRO_ROSTER.filter((member) => member.existing).map((member) => member.key)).toEqual([
      "numan-hatipoglu",
      "halil-karabacak",
    ]);
  });

  it("matches existing CMS names despite titles, case and accents", () => {
    expect(matchKadroMember("M. NUMAN HATIPOGLU")?.key).toBe("numan-hatipoglu");
    expect(matchKadroMember("M. Halil KARABACAK")?.key).toBe("halil-karabacak");
    expect(matchKadroMember("Maître Seçer AKKUŞ")?.key).toBe("secer-akkus");
    expect(normalizePersonName("M. Alpha CISSÉ")).toBe(normalizePersonName("Alpha Cisse"));
  });

  it("does not merge similar but distinct names", () => {
    expect(matchKadroMember("Ahmet Tahir Hatipoglu")?.key).toBe("ahmet-tahir-hatipoglu");
    expect(matchKadroMember("Numan Hatipoglu")?.key).toBe("numan-hatipoglu");
    expect(matchKadroMember("Rabia Hatipoglu")?.key).toBe("rabia-hatipoglu");
    expect(matchKadroMember("Numan Hatipoglu")?.key).not.toBe(matchKadroMember("Ahmet Tahir Hatipoglu")?.key);
  });
});
