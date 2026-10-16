import { NextResponse } from "next/server";
import { ApplicationError } from "@/server/core/application-error";
import { getRequestUser, isAdminUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { deleteOrder, getOrder, updateOrder } from "@/server/orders/order-service";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
    const order = await getOrder((await context.params).orderId);
    if (!order || (!isAdminUser(user) && order.ownerUserId !== user.id)) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar o pedido." }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
    const order = await updateOrder(
      (await context.params).orderId,
      user.id,
      isAdminUser(user),
      await request.json(),
    );
    return NextResponse.json({ order });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível atualizar o pedido." }, { status });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
    await deleteOrder((await context.params).orderId, user.id, isAdminUser(user));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 503;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível excluir o pedido." }, { status });
  }
}
