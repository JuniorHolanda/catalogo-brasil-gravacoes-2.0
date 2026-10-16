import { POST as handlePost } from "@/server/http/quote-preview";

export const runtime = "nodejs";

export function POST(request: Request) {
  return handlePost(request);
}
