import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { countryCodeCheck, id, localeEnum, notBlank, timestamps } from "./common";
import { expertises } from "./expertises";
import { projects } from "./projects";
import { users } from "./users";

export const inquiryTypeEnum = pgEnum("inquiry_type", ["contact", "project_request"]);
export const inquiryStatusEnum = pgEnum("inquiry_status", ["new", "read", "reviewing", "replied", "archived"]);
export const inquiryNotifyEnum = pgEnum("inquiry_notify_status", ["skipped", "sent", "failed"]);

export const inquiryStatuses = ["new", "reviewing", "replied", "archived"] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];

/** Contact and project requests. Personal data: role-restricted, never copied into logs. */
export const inquiries = pgTable(
  "inquiries",
  {
    id: id(),
    type: inquiryTypeEnum("type").notNull(),
    locale: localeEnum("locale").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    organization: text("organization"),
    countryCode: text("country_code"),
    message: text("message").notNull(),
    relatedExpertiseId: uuid("related_expertise_id").references(() => expertises.id, {
      onDelete: "set null",
    }),
    relatedProjectId: uuid("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    privacyConsentAt: timestamp("privacy_consent_at", { withTimezone: true }).notNull(),
    preferenceConsentAt: timestamp("preference_consent_at", { withTimezone: true }),
    idempotencyKey: uuid("idempotency_key").notNull(),
    status: inquiryStatusEnum("status").default("new").notNull(),
    notifyStatus: inquiryNotifyEnum("notify_status").default("skipped").notNull(),
    notifyError: text("notify_error"),
    handledById: text("handled_by_id").references(() => users.id, { onDelete: "set null" }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    ...timestamps(),
  },
  (t) => [
    index("inquiries_inbox").on(t.status, t.createdAt),
    uniqueIndex("inquiries_idempotency").on(t.idempotencyKey),
    notBlank("inquiries_full_name", t.fullName),
    notBlank("inquiries_email", t.email),
    notBlank("inquiries_message", t.message),
    countryCodeCheck("inquiries_country", t.countryCode),
  ],
);

export const inquiryNotes = pgTable(
  "inquiry_notes",
  {
    id: id(),
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("inquiry_notes_inquiry").on(t.inquiryId, t.createdAt), notBlank("inquiry_notes_body", t.body)],
);
