import type { Metadata } from "next";
import {
  changeRoleAction,
  createUserAction,
  resetPasswordAction,
  revokeSessionsAction,
  setDisabledAction,
} from "@/admin/actions/users";
import { dateTimeFormat, roleOptions } from "@/admin/labels";
import { listUsers } from "@/admin/users";
import { roleLabels } from "@/auth/permissions";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { ConfirmDialog, SelectField, TextField } from "@/components/admin/forms";
import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { CreateUserForm } from "@/components/admin/UserForms";

export const metadata: Metadata = { title: "Kullanıcılar" };

export default async function UsersPage() {
  const me = await requirePermission("users:manage");
  const users = await listUsers(getDb());

  return (
    <>
      <PageHeader
        title="Kullanıcılar"
        description="Panel hesapları yalnızca buradan açılır; herkese açık kayıt yoktur. Yönetici bütün ayarlara, editör yalnızca içerik ve medyaya erişir."
      />
      <div className="grid gap-6">
        <Card title={`Hesaplar (${users.length})`}>
          <ul className="divide-y divide-line">
            {users.map((user) => {
              const isMe = user.id === me.id;
              return (
                <li key={user.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-navy-950">
                      {user.name}
                      {isMe ? <span className="ml-2 text-xs font-normal text-muted">(siz)</span> : null}
                    </p>
                    <p className="truncate text-sm text-muted">{user.email}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Pill>{roleLabels[user.role]}</Pill>
                      {user.disabledAt ? <Pill tone="danger">Devre dışı</Pill> : null}
                      <span>Açık oturum: {user.activeSessions}</span>
                      <span>Oluşturulma: {dateTimeFormat.format(user.createdAt)}</span>
                    </p>
                  </div>
                  {isMe ? (
                    <p className="text-xs text-muted">Kendi hesabınızı Hesabım sayfasından yönetin.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <ConfirmDialog
                        triggerLabel="Rolü değiştir"
                        title={`${user.name} için rol`}
                        description="Rol değişikliği hemen geçerli olur ve kullanıcının açık oturumları kapatılır."
                        confirmLabel="Rolü kaydet"
                        variant="primary"
                        action={changeRoleAction.bind(null, user.id)}
                      >
                        <SelectField label="Rol" name="role" options={roleOptions} defaultValue={user.role} />
                      </ConfirmDialog>
                      <ConfirmDialog
                        triggerLabel="Parola belirle"
                        title={`${user.name} için yeni parola`}
                        description="Yeni parola hemen geçerli olur; kullanıcının açık oturumları kapatılır. Parolayı kendisine güvenli bir kanaldan iletin."
                        confirmLabel="Parolayı kaydet"
                        variant="primary"
                        action={resetPasswordAction.bind(null, user.id)}
                      >
                        <TextField
                          label="Yeni parola"
                          name="password"
                          type="password"
                          minLength={8}
                          maxLength={128}
                          autoComplete="new-password"
                          hint="En az 8 karakter."
                        />
                      </ConfirmDialog>
                      <ConfirmDialog
                        triggerLabel="Oturumları kapat"
                        title="Bütün oturumlar kapatılsın mı?"
                        description={`${user.name} bütün cihazlarda oturumdan çıkarılır; yeniden giriş yapması gerekir.`}
                        confirmLabel="Oturumları kapat"
                        action={revokeSessionsAction.bind(null, user.id)}
                      />
                      {user.disabledAt ? (
                        <ConfirmDialog
                          triggerLabel="Etkinleştir"
                          title="Hesap yeniden etkinleştirilsin mi?"
                          description={`${user.name} yeniden giriş yapabilecek.`}
                          confirmLabel="Etkinleştir"
                          variant="primary"
                          action={setDisabledAction.bind(null, user.id, false)}
                        />
                      ) : (
                        <ConfirmDialog
                          triggerLabel="Devre dışı bırak"
                          title="Hesap devre dışı bırakılsın mı?"
                          description={`${user.name} giriş yapamayacak ve açık oturumları hemen kapatılacak. Geçmiş işlem kayıtları korunur.`}
                          confirmLabel="Devre dışı bırak"
                          action={setDisabledAction.bind(null, user.id, true)}
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Yeni kullanıcı">
          <CreateUserForm action={createUserAction} />
        </Card>
      </div>
    </>
  );
}
