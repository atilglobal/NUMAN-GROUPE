import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInquiry } from "@/admin/inquiries";
import { dateTimeFormat } from "@/admin/labels";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { InquiryNoteForm, InquiryStatusForm } from "@/components/admin/InquiryForms";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Talep" };

const NOTIFY: Record<string, string> = {
  skipped: "E-posta gönderilmedi (yapılandırılmamış)",
  sent: "Bildirim e-postası gönderildi",
  failed: "Bildirim e-postası başarısız; talep kayıtlı",
};

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("inquiries:read");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const entry = await getInquiry(getDb(), id);
  if (!entry) notFound();

  return (
    <>
      <PageHeader
        title={entry.fullName}
        back={{ href: "/admin/talepler", label: "Talepler" }}
        description={`${entry.type === "project_request" ? "Proje talebi" : "İletişim"} · ${entry.locale.toUpperCase()}`}
      />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
        <Card title="Kayıt">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">E-posta</dt>
              <dd>{entry.email}</dd>
            </div>
            {entry.phone ? (
              <div>
                <dt className="text-xs text-muted">Telefon</dt>
                <dd>{entry.phone}</dd>
              </div>
            ) : null}
            {entry.organization ? (
              <div>
                <dt className="text-xs text-muted">Kurum</dt>
                <dd>{entry.organization}</dd>
              </div>
            ) : null}
            {entry.countryCode ? (
              <div>
                <dt className="text-xs text-muted">Ülke</dt>
                <dd>{entry.countryCode}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-muted">Mesaj</dt>
              <dd className="whitespace-pre-wrap">{entry.message}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Bildirim</dt>
              <dd>
                {NOTIFY[entry.notifyStatus]}
                {entry.notifyError ? <span className="mt-1 block text-xs text-muted">{entry.notifyError}</span> : null}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Alındı</dt>
              <dd>{dateTimeFormat.format(entry.createdAt)}</dd>
            </div>
          </dl>
        </Card>
        </div>
        <div className="grid gap-6 lg:col-span-5">
          <Card title="Durum">
            <InquiryStatusForm id={id} status={entry.status} />
          </Card>
          <Card title="İç notlar">
            {entry.notes.length === 0 ? <p className="mb-4 text-sm text-muted">Henüz not yok.</p> : null}
            <ul className="mb-4 grid gap-3">
              {entry.notes.map((note) => (
                <li key={note.id} className="rounded-md border border-line p-3 text-sm">
                  <p className="whitespace-pre-wrap">{note.body}</p>
                  <p className="mt-2 text-xs text-muted">{dateTimeFormat.format(note.createdAt)}</p>
                </li>
              ))}
            </ul>
            <InquiryNoteForm id={id} />
          </Card>
        </div>
      </div>
    </>
  );
}
