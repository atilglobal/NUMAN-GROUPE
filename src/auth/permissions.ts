import type { UserRole } from "../db/schema/users";

export const permissions = [
  "content:write",
  "media:write",
  "inquiries:read",
  "users:manage",
  "settings:manage",
  "audit:read",
] as const;

export type Permission = (typeof permissions)[number];

const grants: Record<UserRole, readonly Permission[]> = {
  admin: permissions,
  editor: ["content:write", "media:write"],
};

export function can(role: UserRole, permission: Permission): boolean {
  return grants[role].includes(permission);
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Yönetici",
  editor: "Editör",
};
