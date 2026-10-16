import type { Metadata } from "next";
import { createVisitAction } from "@/admin/actions/visits";
import { requirePermission } from "@/auth/session";
import { countryOptions } from "@/lib/countries";
import { listImagesForPicker } from "@/media/store";
import { getDb } from "@/db/client";
import { NewVisitForm } from "@/components/admin/VisitForms";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Yeni ziyaret" };

export default async function NewVisitPage() {
  await requirePermission("content:write");
  const media = await listImagesForPicker(getDb());
  return (
    <>
      <PageHeader title="Yeni ziyaret" back={{ href: "/admin/ziyaretler", label: "Resmî ziyaretler" }} />
      <Card>
        <NewVisitForm action={createVisitAction} countryOptions={countryOptions("tr")} media={media} />
      </Card>
    </>
  );
}
