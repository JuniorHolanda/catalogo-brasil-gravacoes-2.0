import { NextResponse } from "next/server";
import { getMongoClient } from "@/server/database/mongodb";

export const runtime = "nodejs";

function getSafeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  return message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[redacted MongoDB URI]")
    .slice(0, 500);
}

export async function GET() {
  try {
    await getMongoClient().db().command({ ping: 1 });
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("[api/health] MongoDB ping failed:", getSafeErrorMessage(error));
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503 });
  }
}
