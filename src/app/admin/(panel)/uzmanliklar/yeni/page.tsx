import type { Metadata } from "next";
import { createExpertiseAction } from "@/admin/actions/expertises";
import { requirePermission } from "@/auth/session";
import { NewExpertiseForm } from "@/components/admin/ExpertiseForms";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Yeni uzmanlık alanı" };

export default async function NewExpertisePage() {
  await requirePermission("content:write");
  return (
    <>
      <PageHeader title="Yeni uzmanlık alanı" back={{ href: "/admin/uzmanliklar", label: "Uzmanlık alanları" }} />
      <Card>
        <NewExpertiseForm action={createExpertiseAction} />
      </Card>
    </>
  );
}
