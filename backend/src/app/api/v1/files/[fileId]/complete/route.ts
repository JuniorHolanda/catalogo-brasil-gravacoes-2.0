import { POST as handlePost } from "@/server/http/files/complete";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fileId: string }> };

export function POST(request: Request, context: RouteContext) {
  return handlePost(request, context);
}
