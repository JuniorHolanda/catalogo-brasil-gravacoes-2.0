import { NextResponse } from "next/server";
import { ApplicationError } from "@/server/core/application-error";
import { getRequestUser, isAdminUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { deleteCustomerQuote, getCustomerQuote, updateCustomerQuote } from "@/server/quotes/quote-service";

type RouteContext = { params: Promise<{ quoteId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
    const quote = await getCustomerQuote((await context.params).quoteId);
    if (!quote || (!isAdminUser(user) && quote.ownerUserId !== user.id)) {
      return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar o orçamento." }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
    const quote = await updateCustomerQuote(
      (await context.params).quoteId,
      user.id,
      isAdminUser(user),
      await request.json(),
    );
    return NextResponse.json({ quote });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível atualizar o orçamento." }, { status });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
    await deleteCustomerQuote((await context.params).quoteId, user.id, isAdminUser(user));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 503;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível excluir o orçamento." }, { status });
  }
}
