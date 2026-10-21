import type { Metadata } from "next";
import { createProjectAction } from "@/admin/actions/projects";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { listImagesForPicker } from "@/media/store";
import { NewProjectForm } from "@/components/admin/ProjectForms";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Yeni proje" };

export default async function NewProjectPage() {
  await requirePermission("content:write");
  const media = await listImagesForPicker(getDb());
  return (
    <>
      <PageHeader title="Yeni proje" back={{ href: "/admin/projeler", label: "Projeler" }} />
      <Card>
        <NewProjectForm action={createProjectAction} media={media} />
      </Card>
    </>
  );
}
