import type { Metadata } from "next";
import { changePasswordAction, signOutOtherSessionsAction } from "@/admin/actions/auth";
import { roleLabels } from "@/auth/permissions";
import { requireUser } from "@/auth/session";
import { ChangePasswordForm } from "@/components/admin/AccountForms";
import { ConfirmDialog } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Hesabım" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Hesabım" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Bilgiler">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted">Ad soyad</dt>
              <dd className="font-medium text-navy-950">{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted">E-posta</dt>
              <dd className="font-medium text-navy-950">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Rol</dt>
              <dd className="font-medium text-navy-950">{roleLabels[user.role]}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">Ad, e-posta ve rol değişiklikleri için bir yöneticiye başvurun.</p>
        </Card>
        <Card title="Parola değiştir">
          <ChangePasswordForm action={changePasswordAction} />
        </Card>
        <Card title="Oturumlar">
          <p className="mb-3 text-sm text-muted">
            Oturumlar 12 saat sonra kendiliğinden sona erer. Başka bir cihazda açık kalmış olabilecek oturumları hemen kapatabilirsiniz.
          </p>
          <ConfirmDialog
            triggerLabel="Diğer oturumları kapat"
            title="Diğer oturumlar kapatılsın mı?"
            description="Bu cihaz dışındaki bütün oturumlarınız sonlandırılır."
            confirmLabel="Kapat"
            action={signOutOtherSessionsAction}
          />
        </Card>
      </div>
    </>
  );
}
