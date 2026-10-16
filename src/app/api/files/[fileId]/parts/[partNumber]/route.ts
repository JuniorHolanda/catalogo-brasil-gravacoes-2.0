import { PUT as handlePut } from "@/server/http/files/part";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fileId: string; partNumber: string }> };

export function PUT(request: Request, context: RouteContext) {
  return handlePut(request, context);
}
