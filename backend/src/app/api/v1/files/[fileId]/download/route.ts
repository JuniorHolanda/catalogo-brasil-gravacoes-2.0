import { GET as handleGet } from "@/server/http/files/download";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fileId: string }> };

export function GET(request: Request, context: RouteContext) {
  return handleGet(request, context);
}
