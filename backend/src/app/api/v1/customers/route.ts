import { POST as handlePost } from "@/server/http/customers";

export const runtime = "nodejs";

export function POST(request: Request) {
  return handlePost(request);
}
