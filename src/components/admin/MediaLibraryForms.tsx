"use client";

import { deleteMediaAction, updateMediaTextAction } from "@/admin/actions/media";
import type { MediaUsage } from "@/media/usage";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, ConfirmDialog, FormStatus, SubmitButton, TextField } from "./forms";
import { MediaUploadForm } from "./MediaPicker";

export { MediaUploadForm };

export function MediaTextForm({ item }: { item: MediaPickerItem }) {
  const action = updateMediaTextAction.bind(null, item.id);
  return (
    <ActionForm action={action} className="grid gap-4">
      <FormStatus />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Alt metin (FR)" name="altFr" defaultValue={item.alts.fr ?? ""} maxLength={200} />
        <TextField label="Alt metin (EN)" name="altEn" defaultValue={item.alts.en ?? ""} maxLength={200} />
        <TextField label="Alt metin (TR)" name="altTr" defaultValue={item.alts.tr ?? ""} maxLength={200} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Açıklama (FR)" name="captionFr" defaultValue={item.captions.fr ?? ""} maxLength={240} />
        <TextField label="Açıklama (EN)" name="captionEn" defaultValue={item.captions.en ?? ""} maxLength={240} />
        <TextField label="Açıklama (TR)" name="captionTr" defaultValue={item.captions.tr ?? ""} maxLength={240} />
      </div>
      <div>
        <SubmitButton>Metinleri kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function MediaDeleteForm({ id, usages }: { id: string; usages: MediaUsage[] }) {
  const used = usages.length > 0;
  if (used) {
    return (
      <p className="text-sm text-muted">
        Bu görsel {usages.length} yerde bağlı. Kullanımdaki medya silinemez; önce içerikten çıkarın.
      </p>
    );
  }
  return (
    <ConfirmDialog
      triggerLabel="Dosyayı sil"
      title="Dosyayı sil"
      description={<p>Dosya depodan ve kayıtlardan silinir. Geri alınamaz.</p>}
      confirmLabel="Sil"
      action={deleteMediaAction.bind(null, id)}
    />
  );
}
