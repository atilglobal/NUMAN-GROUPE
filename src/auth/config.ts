import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client";
import { accounts, sessions, users, verifications } from "../db/schema";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

/** Panel sessions: 12 h lifetime, extended at most once per hour of activity. */
const SESSION_EXPIRES_IN = 60 * 60 * 12;
const SESSION_UPDATE_AGE = 60 * 60;

type AuthEnv = {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  SITE_URL?: string;
  NODE_ENV?: string;
  AUTH_IP_HEADER?: string;
};

export function authSecret(env: AuthEnv = process.env): string {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set to a random value of at least 32 characters (see .env.example).",
    );
  }
  return secret;
}

/**
 * Better Auth with e-mail/password only. Sign-up is disabled and no HTTP
 * handler is mounted: sign-in, sign-out and password changes run through
 * Server Actions calling `auth.api`, so the only entry points are ours.
 */
export function createAuth(db: Database, plugins: BetterAuthPlugin[] = [], env: AuthEnv = process.env) {
  return betterAuth({
    secret: authSecret(env),
    baseURL: env.BETTER_AUTH_URL ?? env.SITE_URL ?? "http://localhost:3000",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { users, sessions, accounts, verifications },
    }),
    user: {
      modelName: "users",
      additionalFields: {
        role: { type: "string", input: false, required: false },
      },
    },
    session: {
      modelName: "sessions",
      expiresIn: SESSION_EXPIRES_IN,
      updateAge: SESSION_UPDATE_AGE,
      // Every request re-reads the session row, so revocation is immediate.
      cookieCache: { enabled: false },
    },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      revokeSessionsOnPasswordReset: true,
    },
    databaseHooks: {
      session: {
        create: {
          // A disabled account cannot obtain a new session.
          before: async (session) => {
            const [user] = await db
              .select({ disabledAt: users.disabledAt })
              .from(users)
              .where(eq(users.id, session.userId));
            if (!user || user.disabledAt) return false;
          },
        },
      },
    },
    advanced: {
      useSecureCookies: env.NODE_ENV === "production",
      database: { generateId: () => crypto.randomUUID() },
      // Same trust rule as clientIpFrom(): only a proxy-set header, never a default.
      ipAddress: env.AUTH_IP_HEADER
        ? { ipAddressHeaders: [env.AUTH_IP_HEADER.toLowerCase()] }
        : { disableIpTracking: true },
    },
    telemetry: { enabled: false },
    logger: { level: "error" },
    plugins,
  });
}

export type Auth = ReturnType<typeof createAuth>;
