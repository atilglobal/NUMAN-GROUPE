import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import { createTestDb, truncateAll } from "@/db/testing";
import { restoreUiString, saveUiString } from "./ui-strings";
import { AdminRuleError, createUserWithPassword } from "./users";
import { uiStringOverrides } from "@/db/schema";

let db: Database;
let close: () => Promise<void>;
let actor: { id: string };

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(async () => {
  await truncateAll(db);
  actor = {
    id: await createUserWithPassword(
      db,
      { name: "Editor", email: "editor@example.org", role: "editor", password: "editor password 1" },
      null,
    ),
  };
});

describe("ui string overlays", () => {
  it("stores a panel override and restores the dictionary default", async () => {
    await saveUiString(db, actor, "nav.contact", "fr", "Écrire");
    const rows = await db.select().from(uiStringOverrides);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.value).toBe("Écrire");
    await restoreUiString(db, actor, "nav.contact", "fr");
    expect(await db.select().from(uiStringOverrides)).toHaveLength(0);
  });

  it("rejects unknown keys, blank values and broken placeholders", async () => {
    await expect(saveUiString(db, actor, "not.a.key", "fr", "x")).rejects.toBeInstanceOf(AdminRuleError);
    await expect(saveUiString(db, actor, "nav.contact", "fr", "   ")).rejects.toBeInstanceOf(AdminRuleError);
    await expect(saveUiString(db, actor, "projects.pageOf", "fr", "Page seulement")).rejects.toBeInstanceOf(
      AdminRuleError,
    );
  });
});
