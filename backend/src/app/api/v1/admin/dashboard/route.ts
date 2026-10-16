import { NextResponse } from "next/server";
import { getRequestUser, isAdminUser } from "@/server/auth/request-auth";
import { getAdminDashboardData } from "@/server/admin/dashboard-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
    if (!isAdminUser(user)) return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });
    return NextResponse.json(await getAdminDashboardData());
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar a dashboard administrativa." }, { status: 503 });
  }
}
