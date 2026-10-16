"use client";

import { addInquiryNoteAction, setInquiryStatusAction } from "@/admin/actions/inquiries";
import { inquiryStatuses } from "@/db/schema";
import { ActionForm, FormStatus, SelectField, SubmitButton, TextAreaField } from "./forms";

const STATUS_LABELS: Record<(typeof inquiryStatuses)[number], string> = {
  new: "Yeni",
  reviewing: "İnceleniyor",
  replied: "Yanıtlandı",
  archived: "Arşivlendi",
};

export function InquiryStatusForm({ id, status }: { id: string; status: (typeof inquiryStatuses)[number] }) {
  return (
    <ActionForm action={setInquiryStatusAction.bind(null, id)} className="grid gap-3">
      <FormStatus />
      <SelectField
        label="Durum"
        name="status"
        defaultValue={status}
        options={inquiryStatuses.map((value) => ({ value, label: STATUS_LABELS[value] }))}
      />
      <div>
        <SubmitButton>Durumu kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function InquiryNoteForm({ id }: { id: string }) {
  return (
    <ActionForm action={addInquiryNoteAction.bind(null, id)} className="grid gap-3" resetOnSuccess>
      <FormStatus />
      <TextAreaField label="İç not" name="body" rows={4} maxLength={4000} required />
      <p className="text-xs text-muted">Not yalnızca panelde görünür; public sitede yok.</p>
      <div>
        <SubmitButton variant="secondary">Not ekle</SubmitButton>
      </div>
    </ActionForm>
  );
}
