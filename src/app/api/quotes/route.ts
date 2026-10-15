import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import engravingMethods from "@/data/engraving-methods.json";
import { readBodyWithLimit } from "@/lib/customer-files";
import { getCustomerFilesCollection, getCustomerQuotesCollection } from "@/lib/mongodb";
import { validateQuoteSubmission } from "@/lib/quote-validation";
import { getRequestUser, isSameOriginRequest } from "@/lib/request-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Entre na sua conta para ver seus pedidos." }, { status: 401 });
  }

  try {
    const quotes = await (await getCustomerQuotesCollection())
      .find({ ownerUserId: user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .project({ number: 1, status: 1 })
      .toArray();

    return NextResponse.json({
      orders: quotes.map((quote) => ({ number: quote.number, status: quote.status })),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar seus pedidos." }, { status: 503 });
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
    if (contentLength > 8_192) {
      return NextResponse.json({ error: "Os dados do orçamento excedem o tamanho permitido." }, { status: 413 });
    }
    const rawBody = await readBodyWithLimit(request, 8_192);
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "Os dados do orçamento excedem o tamanho permitido." }, { status: 413 });
    }
    return NextResponse.json({ error: "Os dados do orçamento são inválidos." }, { status: 400 });
  }

  const validation = validateQuoteSubmission(payload);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const input = validation.value;
  const service = engravingMethods.find((item) => item.slug === input.serviceSlug);
  if (!service || service.name !== input.serviceName || !service.products.includes(input.product)) {
    return NextResponse.json({ error: "Confira o serviço e o produto selecionados." }, { status: 400 });
  }
  if (input.requestType === "automatic" && !service.supportsPreQuote) {
    return NextResponse.json({ error: "Este serviço precisa de um orçamento pela equipe." }, { status: 400 });
  }

  try {
    if (input.fileId) {
      if (!ObjectId.isValid(input.fileId)) {
        return NextResponse.json({ error: "O arquivo anexado é inválido." }, { status: 400 });
      }
      const file = await (await getCustomerFilesCollection()).findOne({
        _id: new ObjectId(input.fileId),
        ownerUserId: user.id,
        status: "ready",
      });
      if (!file) {
        return NextResponse.json({ error: "O arquivo não está disponível na sua conta." }, { status: 400 });
      }
    }

    const now = new Date();
    const number = `BG-${now.getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    await (await getCustomerQuotesCollection()).insertOne({
      ownerUserId: user.id,
      number,
      serviceSlug: service.slug,
      serviceName: service.name,
      requestType: input.requestType,
      product: input.product,
      quantity: input.quantity,
      logoWidthMm: input.logoWidthMm,
      logoHeightMm: input.logoHeightMm,
      colorCount: input.colorCount,
      ...(input.fileId ? { customerFileId: input.fileId } : {}),
      status: "awaiting",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      number,
      serviceName: service.name,
      status: "awaiting",
      requestType: input.requestType,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar o orçamento agora." }, { status: 503 });
  }
}
