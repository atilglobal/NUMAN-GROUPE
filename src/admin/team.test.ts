import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { listTeam } from "@/content/queries";
import { setTranslationStatus } from "@/content/publishing";
import type { Database } from "@/db/client";
import { createTestDb, truncateAll } from "@/db/testing";
import { createTeamMember, saveTeamTranslation, updateTeamRoot } from "./team";
import { createUserWithPassword } from "./users";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

let db: Database;
let close: () => Promise<void>;
let actor: { id: string; ip: string };

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(async () => {
  await truncateAll(db);
  const id = await createUserWithPassword(
    db,
    { name: "Editor", email: "editor@example.org", role: "editor", password: "editor password 1" },
    null,
  );
  actor = { id, ip: "192.0.2.10" };
});

describe("team editing", () => {
  it("stays off the public site until published and visible", async () => {
    const id = await createTeamMember(db, actor, {
      root: {
        fullName: "Personne A",
        sortOrder: 1,
        isVisible: true,
        photoAssetId: null,
        linkLabel: "Profil",
        linkUrl: "https://example.org/a",
      },
      locale: "fr",
      translation: { roleTitle: "Direction", bio: "Texte" },
    });
    expect(await listTeam(db, "fr", { demo: false })).toEqual([]);

    await setTranslationStatus(db, {
      entity: "team_member",
      entityId: id,
      locale: "fr",
      status: "published",
      actorUserId: actor.id,
    });
    expect((await listTeam(db, "fr", { demo: false })).map((row) => row.fullName)).toEqual(["Personne A"]);

    await saveTeamTranslation(db, actor, id, "en", { roleTitle: "Leadership", bio: null });
    await setTranslationStatus(db, {
      entity: "team_member",
      entityId: id,
      locale: "en",
      status: "published",
      actorUserId: actor.id,
    });
    expect((await listTeam(db, "en", { demo: false }))[0]).toMatchObject({
      fullName: "Personne A",
      roleTitle: "Leadership",
      links: [{ label: "Profil", url: "https://example.org/a" }],
    });

    await updateTeamRoot(db, actor, id, {
      fullName: "Personne A",
      sortOrder: 1,
      isVisible: false,
      photoAssetId: null,
      linkLabel: null,
      linkUrl: null,
    });
    expect(await listTeam(db, "fr", { demo: false })).toEqual([]);
  });
});
