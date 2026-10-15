import "server-only";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth/minimal";
import { getMongoClient, getMongoDatabase } from "@/lib/mongodb";

function buildAuth() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  return betterAuth({
    appName: "Brasil Gravações",
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(getMongoDatabase(), { client: getMongoClient() }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        companyName: { type: "string", required: false, input: true },
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
          input: false,
        },
      },
    },
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {},
    trustedOrigins: [baseURL],
  });
}

type AuthInstance = ReturnType<typeof buildAuth>;
let authInstance: AuthInstance | undefined;

/** Inicializa Better Auth sob demanda para que o build não abra conexão ao Atlas. */
export function getAuth(): AuthInstance {
  if (!authInstance) authInstance = buildAuth();
  return authInstance;
}
