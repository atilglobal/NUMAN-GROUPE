import type { Metadata } from "next";
import { createProjectAction } from "@/admin/actions/projects";
import { listExpertiseOptions } from "@/admin/projects";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { countryOptions } from "@/lib/countries";
import { listImagesForPicker } from "@/media/store";
import { NewProjectForm } from "@/components/admin/ProjectForms";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Yeni proje" };

export default async function NewProjectPage() {
  await requirePermission("content:write");
  const db = getDb();
  const [expertises, media] = await Promise.all([listExpertiseOptions(db), listImagesForPicker(db)]);
  return (
    <>
      <PageHeader title="Yeni proje" back={{ href: "/admin/projeler", label: "Projeler" }} />
      <Card>
        <NewProjectForm
          action={createProjectAction}
          expertiseOptions={expertises.map((item) => ({ value: item.id, label: item.label }))}
          countryOptions={countryOptions("tr")}
          media={media}
        />
      </Card>
    </>
  );
}
