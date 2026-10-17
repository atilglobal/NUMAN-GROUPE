"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIpFrom } from "@/auth/client-ip";
import type { ActionState } from "@/auth/session";
import { tryGetDb } from "@/db/client";
import { LOGIN_PATH } from "@/auth/session";
import { isTrustedSetupOrigin } from "./origin";
import { completeSetup, publicSetupView } from "./run";

export async function submitSetupAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const requestHeaders = await headers();
  if (!isTrustedSetupOrigin(requestHeaders)) {
    return { ok: false, message: "Kurulum kapalı." };
  }

  const db = tryGetDb();
  const view = await publicSetupView(db);
  if (!db || view.kind !== "open") {
    return { ok: false, message: view.kind === "admin_exists" || view.kind === "locked" ? "Kurulum kilitli." : "Kurulum kapalı." };
  }

  const result = await completeSetup(
    db,
    {
      setupKey: String(formData.get("setupKey") ?? ""),
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    },
    { ip: clientIpFrom(requestHeaders) },
  );

  if (!result.ok) return { ok: false, message: result.message, fieldErrors: result.fieldErrors };
  redirect(LOGIN_PATH);
}
