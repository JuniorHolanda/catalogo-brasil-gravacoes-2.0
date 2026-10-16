import { GET as handleGet, POST as handlePost } from "@/server/http/auth";

export const runtime = "nodejs";

export function GET(request: Request) {
  return handleGet(request);
}

export function POST(request: Request) {
  return handlePost(request);
}
