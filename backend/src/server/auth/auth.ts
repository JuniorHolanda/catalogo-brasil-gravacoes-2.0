import "server-only";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";
import { getMongoClient, getMongoDatabase } from "@/server/database/mongodb";
import { getAuthAvailability } from "@/server/auth/auth-availability";

const frontendOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function buildAuth() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const availability = getAuthAvailability();

  return betterAuth({
    appName: "Brasil Gravações",
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(getMongoDatabase(), { client: getMongoClient() }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !availability.emailSignUp,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: availability.verificationEmail,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.STORAGE_ALERT_FROM;
        if (!apiKey || !from) throw new Error("Configure RESEND_API_KEY e STORAGE_ALERT_FROM para enviar a verificação de e-mail.");
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [user.email],
            subject: "Confirme seu e-mail | Brasil Gravações",
            text: `Olá, ${user.name}. Confirme seu e-mail neste link: ${url}`,
          }),
          signal: AbortSignal.timeout(8_000),
        });
        if (!response.ok) throw new Error("O serviço de e-mail não aceitou a mensagem de verificação.");
      },
    },
    user: {
      modelName: "users",
      additionalFields: {
        companyName: { type: "string", required: false, input: true },
      },
    },
    plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })],
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {},
    trustedOrigins: [...frontendOrigins, baseURL],
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  });
}

type AuthInstance = ReturnType<typeof buildAuth>;
let authInstance: AuthInstance | undefined;

/** Inicializa Better Auth sob demanda para que o build não abra conexão ao Atlas. */
export function getAuth(): AuthInstance {
  if (!authInstance) authInstance = buildAuth();
  return authInstance;
}

/** Copia usuários criados antes da separação para a coleção plural usada pela API. */
let legacyUserMigration: Promise<void> | undefined;
export async function migrateLegacyAuthUsers(): Promise<void> {
  if (!legacyUserMigration) {
    legacyUserMigration = (async () => {
      const database = getMongoDatabase();
      const hasLegacyUsers = await database.listCollections({ name: "user" }, { nameOnly: true }).hasNext();
      if (!hasLegacyUsers) return;
      await database.collection("user").aggregate([
        {
          $merge: {
            into: "users",
            on: "_id",
            whenMatched: "keepExisting",
            whenNotMatched: "insert",
          },
        },
      ]).toArray();
    })().catch((error: unknown) => {
      legacyUserMigration = undefined;
      throw error;
    });
  }
  await legacyUserMigration;
}
