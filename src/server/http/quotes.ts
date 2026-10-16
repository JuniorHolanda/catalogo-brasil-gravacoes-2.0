import "server-only";

import { NextResponse } from "next/server";
import { ApplicationError } from "@/server/core/application-error";
import { readBodyWithLimit } from "@/server/files/customer-files";
import { getRequestUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { createCustomerQuote, listRecentCustomerQuotes } from "@/server/quotes/quote-service";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Entre na sua conta para ver seus pedidos." }, { status: 401 });
  }

  try {
    const orders = await listRecentCustomerQuotes(user.id);
    return NextResponse.json({ orders });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 503;
    const message = error instanceof ApplicationError
      ? error.message
      : "Não foi possível carregar seus pedidos.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Crie uma conta ou entre para enviar o orçamento." }, { status: 401 });
  }

  let payload: unknown;
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 32_768) {
      return NextResponse.json({ error: "Os dados do orçamento excedem o tamanho permitido." }, { status: 413 });
    }
    const rawBody = await readBodyWithLimit(request, 32_768);
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "Os dados do orçamento excedem o tamanho permitido." }, { status: 413 });
    }
    return NextResponse.json({ error: "Os dados do orçamento são inválidos." }, { status: 400 });
  }

  try {
    const quote = await createCustomerQuote(user.id, payload);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 503;
    const message = error instanceof ApplicationError
      ? error.message
      : "Não foi possível salvar o orçamento agora.";
    return NextResponse.json({ error: message }, { status });
  }
}
