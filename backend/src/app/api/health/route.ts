import { NextResponse } from "next/server";
import { getMongoClient } from "@/server/database/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getMongoClient().db().command({ ping: 1 });
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503 });
  }
}
