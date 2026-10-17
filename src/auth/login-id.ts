/** Internal domain so a panel username satisfies Better Auth's e-mail check. */
export const PANEL_LOGIN_DOMAIN = "panel.local";

export function normalizePanelLogin(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return trimmed;
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed}@${PANEL_LOGIN_DOMAIN}`;
}
