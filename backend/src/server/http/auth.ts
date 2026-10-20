import "server-only";

import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, migrateLegacyAuthUsers } from "@/server/auth/auth";
import { getAuthAvailability } from "@/server/auth/auth-availability";

const emailDeliveryPaths = new Set([
  "/api/auth/sign-up/email",
  "/api/auth/send-verification-email",
  "/api/auth/request-password-reset",
]);

async function handleAuth(request: Request) {
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  if (request.method === "POST" && emailDeliveryPaths.has(path) && !getAuthAvailability().verificationEmail) {
    return Response.json({
      code: "EMAIL_SERVICE_UNAVAILABLE",
      message: "A confirmação por e-mail está temporariamente indisponível. Tente novamente mais tarde.",
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  await migrateLegacyAuthUsers();
  const handlers = toNextJsHandler(getAuth());
  return request.method === "GET" ? handlers.GET(request) : handlers.POST(request);
}

export const GET = handleAuth;
export const POST = handleAuth;
