import type { Metadata } from "next";
import { updateSettingsAction } from "@/admin/actions/settings";
import { getSiteSettings } from "@/admin/settings";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { listImagesForPicker } from "@/media/store";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Site ayarları" };

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  const db = getDb();
  const [settings, media] = await Promise.all([getSiteSettings(db), listImagesForPicker(db)]);

  return (
    <>
      <PageHeader
        title="Site ayarları"
        description="Logo, iletişim ve sosyal bağlantılar. Boş alan sitede gösterilmez."
      />
      <Card title="Kimlik ve iletişim">
        <SettingsForm
          action={updateSettingsAction}
          media={media}
          defaults={{
            companyName: settings.companyName ?? "",
            contactEmail: settings.contactEmail ?? "",
            contactPhone: settings.contactPhone ?? "",
            postalAddress: settings.postalAddress ?? "",
            whatsapp: settings.whatsapp ?? "",
            logoAssetId: settings.logoAssetId,
            faviconAssetId: settings.faviconAssetId,
            socialLinks: settings.socialLinks,
          }}
        />
      </Card>
    </>
  );
}
