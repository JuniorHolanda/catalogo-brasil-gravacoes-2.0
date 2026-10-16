import "server-only";

import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import engravingMethods from "@/data/engraving-methods.json";
import { ApplicationError } from "@/server/core/application-error";
import { getCustomerFilesCollection, getCustomerQuotesCollection } from "@/server/database/mongodb";
import { calculateQuotePricing } from "@/server/quotes/quote-pricing";
import { validateQuoteSubmission } from "@/server/quotes/quote-validation";

export async function listRecentCustomerQuotes(ownerUserId: string) {
  try {
    const quotes = await (await getCustomerQuotesCollection())
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
    await (await getCustomerQuotesCollection()).insertOne({
      ownerUserId,
      number,
      serviceSlug: service.slug,
      serviceName: service.name,
      requestType: input.requestType,
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
