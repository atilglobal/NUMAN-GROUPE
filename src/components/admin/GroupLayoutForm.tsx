"use client";

import type { ActionState } from "@/auth/session";
import type { GroupSectionLayout } from "@/content/group-layout";
import { GROUP_SECTION_KEYS } from "@/content/group-layout";
import { ActionForm, FormStatus, SubmitButton } from "./forms";

const LABELS: Record<(typeof GROUP_SECTION_KEYS)[number], string> = {
  hero: "Karşılama",
  snapshot: "Bir bakışta",
  identity: "Biz kimiz",
  history: "Tarihçe",
  mission: "Misyon",
  vision: "Vizyon",
  sectors: "Sektörler",
  finance: "Finansal yapılandırma",
  regions: "Uluslararası faaliyetler",
  method: "Çalışma yaklaşımı",
  principles: "İlkeler",
  organization: "Organizasyon",
  quality: "Kalite (isteğe bağlı)",
  future: "Gelecek yönelimleri",
  closing: "İletişim çağrısı",
};

export function GroupLayoutForm({
  action,
  layout,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  layout: GroupSectionLayout[];
}) {
  return (
    <ActionForm action={action} className="grid gap-3">
      <FormStatus />
      <p className="text-sm text-muted">
        Boş isteğe bağlı bölümler sitede zaten gizlenir. Burada bir bölümü kapatmak içeriği silmez.
      </p>
      <ol className="grid gap-2">
        {layout.map((item) => (
          <li key={item.key} className="flex items-center gap-3 rounded-md border border-line px-3 py-2">
            <input type="hidden" name="groupSection" value={item.key} />
            <label className="flex min-h-10 flex-1 items-center gap-3 text-sm">
              <input type="checkbox" name="groupVisible" value={item.key} defaultChecked={item.visible} />
              {LABELS[item.key]}
            </label>
          </li>
        ))}
      </ol>
      <div>
        <SubmitButton>Düzeni kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}
