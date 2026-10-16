import "server-only";

import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth/auth";

async function handleAuth(request: Request) {
  const handlers = toNextJsHandler(getAuth());
  return request.method === "GET" ? handlers.GET(request) : handlers.POST(request);
}

export const GET = handleAuth;
export const POST = handleAuth;
