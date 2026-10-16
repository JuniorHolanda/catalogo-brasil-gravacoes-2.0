import { DELETE as handleDelete } from "@/server/http/files/item";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fileId: string }> };

export function DELETE(request: Request, context: RouteContext) {
  return handleDelete(request, context);
}
