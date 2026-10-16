import "server-only";

import { randomUUID } from "node:crypto";
import { ObjectId, type WithId } from "mongodb";
import engravingMethods from "@brasil-gravacoes/domain/services";
import { ApplicationError } from "@/server/core/application-error";
import { getCustomerFilesCollection, getQuotesCollection, getOrdersCollection, type QuoteRecord } from "@/server/database/mongodb";
import { calculateQuotePricing } from "@/server/quotes/quote-pricing";
import {
  validateQuotePricingSubmission,
  validateQuoteSubmission,
} from "@/server/quotes/quote-validation";

export function getCustomerQuotePricingPreview(payload: unknown) {
  const validation = validateQuotePricingSubmission(payload);
  if (!validation.success) throw new ApplicationError(validation.error, 400);

  const input = validation.value;
  const service = engravingMethods.find((item) => item.slug === input.serviceSlug);
  if (!service || service.name !== input.serviceName || !service.products.includes(input.product)) {
    throw new ApplicationError("Confira o serviço e o produto selecionados.", 400);
  }

  return calculateQuotePricing({
    serviceSlug: service.slug,
    product: input.product,
    quantity: input.quantity,
    engravings: input.engravings,
  });
}

export async function listRecentCustomerQuotes(ownerUserId: string) {
  try {
    const quotes = await (await getQuotesCollection())
      .find({ ownerUserId })
      .sort({ createdAt: -1 })
      .limit(3)
      .project({ number: 1, status: 1 })
      .toArray();
    return quotes.map((quote) => ({ number: quote.number, status: quote.status }));
  } catch {
    throw new ApplicationError("Não foi possível carregar seus pedidos.", 503);
  }
}

export async function listCustomerQuotes(ownerUserId: string, isAdmin = false) {
  const query = isAdmin ? {} : { ownerUserId };
  const records = await (await getQuotesCollection())
    .find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  return records.map(serializeQuote);
}

export async function getCustomerQuote(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const quote = await (await getQuotesCollection()).findOne({ _id: new ObjectId(id) });
  return quote ? serializeQuote(quote) : null;
}

export async function updateCustomerQuote(
  id: string,
  ownerUserId: string,
  isAdmin: boolean,
  payload: unknown,
) {
  if (!ObjectId.isValid(id)) throw new ApplicationError("Orçamento não encontrado.", 404);
  const collection = await getQuotesCollection();
  const quote = await collection.findOne({ _id: new ObjectId(id) });
  if (!quote || (!isAdmin && quote.ownerUserId !== ownerUserId)) {
    throw new ApplicationError("Orçamento não encontrado.", 404);
  }
  if (!isAdmin && quote.status !== "awaiting") {
    throw new ApplicationError("Este orçamento não pode mais ser alterado.", 409);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApplicationError("Envie os campos que deseja atualizar.", 400);
  }

  const body = payload as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  if (isAdmin && typeof body.status === "string" && ["awaiting", "approved", "rejected", "producing", "problem"].includes(body.status)) {
    updates.status = body.status;
  } else if (Object.hasOwn(body, "status")) {
    throw new ApplicationError("Status de orçamento inválido ou sem permissão.", 400);
  }

  if (body.customer !== undefined) {
    const customer = validateQuoteSubmission({
      serviceSlug: quote.serviceSlug,
      serviceName: quote.serviceName,
      product: quote.product,
      quantity: quote.quantity,
      engravings: quote.engravings,
      requestType: quote.requestType,
      customer: body.customer,
    });
    if (!customer.success) throw new ApplicationError("Confira os dados de contato do orçamento.", 400);
    updates.customer = customer.value.customer;
  }

  if (Object.keys(updates).length === 0) throw new ApplicationError("Nenhum campo válido foi enviado.", 400);
  updates.updatedAt = new Date();
  await collection.updateOne({ _id: quote._id }, { $set: updates });
  return serializeQuote({ ...quote, ...updates } as WithId<QuoteRecord>);
}

export async function deleteCustomerQuote(id: string, ownerUserId: string, isAdmin: boolean) {
  if (!ObjectId.isValid(id)) throw new ApplicationError("Orçamento não encontrado.", 404);
  const quoteId = new ObjectId(id);
  const quote = await (await getQuotesCollection()).findOne({ _id: quoteId });
  if (!quote || (!isAdmin && quote.ownerUserId !== ownerUserId)) {
    throw new ApplicationError("Orçamento não encontrado.", 404);
  }
  if (!isAdmin && quote.status !== "awaiting") {
    throw new ApplicationError("Este orçamento não pode mais ser excluído.", 409);
  }
  const linkedOrder = await (await getOrdersCollection()).findOne({ quoteId: quoteId.toHexString() });
  if (linkedOrder) throw new ApplicationError("Um orçamento vinculado a um pedido não pode ser excluído.", 409);
  await (await getQuotesCollection()).deleteOne({ _id: quoteId });
}

function serializeQuote(quote: WithId<QuoteRecord>) {
  return { ...quote, id: quote._id.toHexString(), _id: undefined };
}

export async function createCustomerQuote(ownerUserId: string, payload: unknown) {
  const validation = validateQuoteSubmission(payload);
  if (!validation.success) throw new ApplicationError(validation.error, 400);

  const input = validation.value;
  const service = engravingMethods.find((item) => item.slug === input.serviceSlug);
  if (!service || service.name !== input.serviceName || !service.products.includes(input.product)) {
    throw new ApplicationError("Confira o serviço e o produto selecionados.", 400);
  }
  if (input.requestType === "automatic" && !service.supportsPreQuote) {
    throw new ApplicationError("Este serviço precisa de um orçamento pela equipe.", 400);
  }

  const pricing = calculateQuotePricing({
    serviceSlug: service.slug,
    product: input.product,
    quantity: input.quantity,
    engravings: input.engravings,
  });
  const submittedFileIds = input.engravings.flatMap((engraving) => engraving.fileId ? [engraving.fileId] : []);
  if (submittedFileIds.some((fileId) => !ObjectId.isValid(fileId))) {
    throw new ApplicationError("Um dos arquivos anexados é inválido.", 400);
  }

  const fileIds = [...new Set(submittedFileIds.map((fileId) => new ObjectId(fileId).toHexString()))];
  try {
    if (fileIds.length > 0) {
      const availableFiles = await (await getCustomerFilesCollection())
        .find({
          _id: { $in: fileIds.map((fileId) => new ObjectId(fileId)) },
          ownerUserId,
          status: "ready",
        })
        .project({ _id: 1 })
        .toArray();
      if (availableFiles.length !== fileIds.length) {
        throw new ApplicationError("Um dos arquivos não está disponível na sua conta.", 400);
      }
    }

    const now = new Date();
    const number = `BG-${now.getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const savedQuote = await (await getQuotesCollection()).insertOne({
      ownerUserId,
      number,
      serviceSlug: service.slug,
      serviceName: service.name,
      requestType: input.requestType,
      customer: input.customer,
      product: input.product,
      quantity: input.quantity,
      pricing,
      engravings: input.engravings.map((engraving) => ({
        location: engraving.location,
        logoWidthMm: engraving.logoWidthMm,
        logoHeightMm: engraving.logoHeightMm,
        colorCount: engraving.colorCount,
        ...(engraving.fileId ? { customerFileId: new ObjectId(engraving.fileId).toHexString() } : {}),
      })),
      status: "awaiting",
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: savedQuote.insertedId.toHexString(),
      number,
      serviceName: service.name,
      status: "awaiting" as const,
      requestType: input.requestType,
      pricing,
    };
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    throw new ApplicationError("Não foi possível salvar o orçamento agora.", 503);
  }
}
