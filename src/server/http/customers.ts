import "server-only";

import { NextResponse } from "next/server";
import { ApplicationError } from "@/server/core/application-error";
import { createCustomerSubmission } from "@/server/customers/customer-service";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "O cadastro deve ser enviado em JSON." },
      { status: 415 },
    );
  }

  let body: unknown;

  try {
    const rawBody = await request.text();
    if (rawBody.length > 12_000) {
      return NextResponse.json({ error: "O cadastro excede o tamanho permitido." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "O corpo da solicitação não é um JSON válido." }, { status: 400 });
  }

  try {
    const id = await createCustomerSubmission(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return NextResponse.json(
        { error: error.message, ...(error.details ? { fields: error.details } : {}) },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "Não foi possível salvar seu cadastro agora." }, { status: 503 });
  }
}
