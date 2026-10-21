import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "./client";
import {
  officialVisitParticipants,
  officialVisitParticipantTranslations,
  officialVisits,
  inquiries,
  projects,
  projectTranslations,
  siteSettings,
} from "./schema";
import { createTestDb, truncateAll } from "./testing";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

/** Drizzle wraps driver errors; the PostgreSQL constraint name sits on the cause. */
async function constraintOf(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise;
  } catch (error) {
    const cause = (error as { cause?: { constraint?: string } }).cause;
    return cause?.constraint ?? (error as { constraint?: string }).constraint;
  }
  throw new Error("Expected the statement to be rejected by the database");
}

async function newProject() {
  const [row] = await db
    .insert(projects)
    .values({ status: "in_progress" })
    .returning({ id: projects.id });
  return row.id;
}

describe("database guarantees", () => {
  it("rejects a duplicate slug within the same language", async () => {
    const a = await newProject();
    const b = await newProject();
    await db.insert(projectTranslations).values({ projectId: a, locale: "fr", slug: "stade", title: "A" });

    expect(
      await constraintOf(
        db.insert(projectTranslations).values({ projectId: b, locale: "fr", slug: "stade", title: "B" }),
      ),
    ).toBe("project_translations_locale_slug");
  });

  it("allows the same slug in another language", async () => {
    const a = await newProject();
    const b = await newProject();
    await db.insert(projectTranslations).values({ projectId: a, locale: "fr", slug: "stade", title: "A" });
    await expect(
      db.insert(projectTranslations).values({ projectId: b, locale: "en", slug: "stade", title: "B" }),
    ).resolves.toBeDefined();
  });

  it("keeps one translation per language for an entry", async () => {
    const a = await newProject();
    await db.insert(projectTranslations).values({ projectId: a, locale: "fr", slug: "un", title: "A" });
    expect(
      await constraintOf(
        db.insert(projectTranslations).values({ projectId: a, locale: "fr", slug: "deux", title: "A" }),
      ),
    ).toBe("project_translations_entity_locale");
  });

  it.each(["Stade", "stade national", "stade--x", "-stade", "stadé"])(
    "rejects the malformed slug %j",
    async (slug) => {
      const a = await newProject();
      expect(
        await constraintOf(
          db.insert(projectTranslations).values({ projectId: a, locale: "fr", slug, title: "A" }),
        ),
      ).toBe("project_translations_slug_format");
    },
  );

  it("refuses a published row without a publication time", async () => {
    const a = await newProject();
    expect(
      await constraintOf(
        db
          .insert(projectTranslations)
          .values({ projectId: a, locale: "fr", slug: "a", title: "A", status: "published" }),
      ),
    ).toBe("project_translations_published_at");
  });

  it("validates project dates, country code and video link", async () => {
    expect(
      await constraintOf(
        db.insert(projects).values({ status: "completed", startedOn: "2025-05-01", completedOn: "2024-01-01" }),
      ),
    ).toBe("projects_dates_order");
    expect(
      await constraintOf(db.insert(projects).values({ status: "completed", countryCode: "fr" })),
    ).toBe("projects_country_code");
    expect(
      await constraintOf(
        db.insert(projects).values({ status: "completed", videoUrl: "http://example.com/v" }),
      ),
    ).toBe("projects_video_url");
  });

  it("rejects an invented progress percentage outside 0–100", async () => {
    expect(
      await constraintOf(db.insert(projects).values({ status: "in_progress", progressPercent: 140 })),
    ).toBe("projects_progress_percent");
  });

  it("leaves unknown dates empty instead of inventing them", async () => {
    const id = await newProject();
    const [row] = await db.select().from(projects).where(eq(projects.id, id));
    expect(row.startedOn).toBeNull();
    expect(row.completedOn).toBeNull();
    expect(row.countryCode).toBeNull();
  });

  it("accepts the planned showcase status", async () => {
    const [row] = await db.insert(projects).values({ status: "planned" }).returning({ status: projects.status });
    expect(row.status).toBe("planned");
  });

  it("rejects a second inquiry with the same idempotency key", async () => {
    const key = crypto.randomUUID();
    const row = {
      type: "contact" as const,
      locale: "fr" as const,
      fullName: "Marie Dupont",
      email: "marie@example.org",
      message: "Message suffisamment long pour le formulaire.",
      privacyConsentAt: new Date(),
      idempotencyKey: key,
    };
    await db.insert(inquiries).values(row);
    expect(await constraintOf(db.insert(inquiries).values({ ...row, email: "other@example.org" }))).toBe(
      "inquiries_idempotency",
    );
  });

  it("keeps site settings to a single row", async () => {
    await db.insert(siteSettings).values({});
    expect(await constraintOf(db.insert(siteSettings).values({ id: 2 }))).toBe(
      "site_settings_single_row",
    );
  });

  it("removes translations and participants with their visit", async () => {
    const [visit] = await db.insert(officialVisits).values({}).returning({ id: officialVisits.id });
    const [person] = await db
      .insert(officialVisitParticipants)
      .values({ visitId: visit.id, fullName: "Nom communiqué" })
      .returning({ id: officialVisitParticipants.id });
    await db
      .insert(officialVisitParticipantTranslations)
      .values({ participantId: person.id, locale: "fr", roleTitle: "Ministre" });

    await db.delete(officialVisits).where(eq(officialVisits.id, visit.id));

    expect(await db.select().from(officialVisitParticipants)).toEqual([]);
    expect(await db.select().from(officialVisitParticipantTranslations)).toEqual([]);
  });
});
