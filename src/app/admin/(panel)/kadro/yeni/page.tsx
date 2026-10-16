import type { Metadata } from "next";
import { createTeamMemberAction } from "@/admin/actions/team";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { listImagesForPicker } from "@/media/store";
import { NewTeamForm } from "@/components/admin/TeamForms";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Yeni kişi" };

export default async function NewTeamPage() {
  await requirePermission("content:write");
  const media = await listImagesForPicker(getDb());
  return (
    <>
      <PageHeader title="Yeni kişi" back={{ href: "/admin/kadro", label: "Kadro" }} />
      <Card>
        <NewTeamForm action={createTeamMemberAction} media={media} />
      </Card>
    </>
  );
}
