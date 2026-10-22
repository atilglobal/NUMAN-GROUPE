import { describe, expect, it } from "vitest";
import { splitExpertiseBody } from "./expertise-body";

describe("splitExpertiseBody", () => {
  it("keeps paragraphs before the first heading as intro", () => {
    const { intro, sections } = splitExpertiseBody(
      "Premier paragraphe.\n\n## Portée\n- Un\n- Deux\n\n## Méthode\n1. A\n2. B\n",
    );
    expect(intro).toEqual([{ type: "paragraph", text: "Premier paragraphe." }]);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.title).toBe("Portée");
    expect(sections[0]?.blocks[0]).toMatchObject({ type: "list", ordered: false, items: ["Un", "Deux"] });
    expect(sections[1]?.title).toBe("Méthode");
  });
});
