import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { inquiries, siteSettings } from "@/db/schema";

/**
 * Optional staff notification. Missing configuration is not an error.
 * A delivery failure never deletes the already-saved inquiry.
 */
export async function notifyInquiry(
  db: Database,
  inquiry: { id: string; type: string; locale: string; fullName: string; email: string; message: string },
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const [settings] = await db
    .select({ contactEmail: siteSettings.contactEmail })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  const to = process.env.INQUIRY_NOTIFY_TO?.trim() || settings?.contactEmail?.trim();
  if (!apiKey || !to) {
    await db.update(inquiries).set({ notifyStatus: "skipped", notifyError: null }).where(eq(inquiries.id, inquiry.id));
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.INQUIRY_NOTIFY_FROM?.trim() || "NUMAN GROUPE <noreply@resend.dev>",
        to: [to],
        subject: `NUMAN GROUPE — ${inquiry.type === "project_request" ? "projet" : "contact"} (${inquiry.locale})`,
        text: `${inquiry.fullName} <${inquiry.email}>\n\n${inquiry.message}`,
      }),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 180);
      await db
        .update(inquiries)
        .set({ notifyStatus: "failed", notifyError: detail || `HTTP ${response.status}` })
        .where(eq(inquiries.id, inquiry.id));
      return;
    }
    await db.update(inquiries).set({ notifyStatus: "sent", notifyError: null }).where(eq(inquiries.id, inquiry.id));
  } catch (error) {
    await db
      .update(inquiries)
      .set({
        notifyStatus: "failed",
        notifyError: error instanceof Error ? error.message.slice(0, 180) : "send failed",
      })
      .where(eq(inquiries.id, inquiry.id));
  }
}
