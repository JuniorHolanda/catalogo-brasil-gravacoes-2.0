import { getAuthAvailability } from "@/server/auth/auth-availability";

export const runtime = "nodejs";

export function GET() {
  return Response.json(getAuthAvailability(), { headers: { "Cache-Control": "no-store" } });
}
