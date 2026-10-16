import { NextResponse } from "next/server";
import { ApplicationError } from "@/server/core/application-error";
import { getRequestUser, isAdminUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { createOrder, listOrders } from "@/server/orders/order-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para ver seus pedidos." }, { status: 401 });
    return NextResponse.json({ orders: await listOrders(user.id, isAdminUser(user)) });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os pedidos." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para confirmar um pedido." }, { status: 401 });
    const order = await createOrder(user.id, isAdminUser(user), await request.json());
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível criar o pedido." }, { status });
  }
}
