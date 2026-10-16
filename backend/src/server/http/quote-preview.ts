import "server-only";

import { NextResponse } from "next/server";
import { ApplicationError } from "@/server/core/application-error";
import { readBodyWithLimit } from "@/server/files/customer-files";
import { isSameOriginRequest } from "@/server/auth/request-auth";
import { getCustomerQuotePricingPreview } from "@/server/quotes/quote-service";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }

  let payload: unknown;
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 16_384) {
      return NextResponse.json({ error: "Os dados do orçamento excedem o tamanho permitido." }, { status: 413 });
    }
    const rawBody = await readBodyWithLimit(request, 16_384);
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "Os dados do orçamento excedem o tamanho permitido." }, { status: 413 });
    }
    return NextResponse.json({ error: "Os dados do orçamento são inválidos." }, { status: 400 });
  }

  try {
    const pricing = getCustomerQuotePricingPreview(payload);
    return NextResponse.json({ pricing });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.status : 503;
    const message = error instanceof ApplicationError
      ? error.message
      : "Não foi possível calcular a prévia agora.";
    return NextResponse.json({ error: message }, { status });
  }
}
