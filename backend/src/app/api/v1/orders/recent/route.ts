import { NextResponse } from "next/server";
import { getRequestUser } from "@/server/auth/request-auth";
import { listRecentAccountActivity } from "@/server/orders/order-service";

export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para ver sua atividade." }, { status: 401 });
    return NextResponse.json({ orders: await listRecentAccountActivity(user.id) });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar sua atividade recente." }, { status: 503 });
  }
}
