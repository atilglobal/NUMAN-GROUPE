import { describe, expect, it } from "vitest";
import { expertiseLayout, sidebarFocuses, splitExpertiseBody } from "./expertise-body";

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

  it("maps heading lists to scope, priorities and process without splitting paragraphs", () => {
    const layout = expertiseLayout(
      "Intro.\n\n## Portée\n- A\n- B\n\n## Priorités\n- P1\n- P2\n- P3\n\n## Méthode\n1. Un\n2. Deux\n",
    );
    expect(layout.intro).toHaveLength(1);
    expect(layout.scope?.title).toBe("Portée");
    expect(layout.priorities?.title).toBe("Priorités");
    expect(layout.process?.title).toBe("Méthode");
    expect(sidebarFocuses("Intro.\n\n## Portée\n- A\n- B\n\n## Priorités\n- P1\n- P2\n- P3\n")).toEqual([
      "P1",
      "P2",
      "P3",
    ]);
  });
});
