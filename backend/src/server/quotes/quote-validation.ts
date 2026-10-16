import "server-only";

import { validateCustomerSubmission, type CustomerSubmission } from "@/server/customers/customer-validation";

export type QuoteRequestType = "automatic" | "whatsapp";

export type QuoteEngravingSubmission = {
  location: string;
  logoWidthMm: number;
  logoHeightMm: number;
  colorCount: number;
  fileId?: string;
};

export type QuotePricingSubmission = {
  serviceSlug: string;
  serviceName: string;
  product: string;
  quantity: number;
  engravings: QuoteEngravingSubmission[];
};

export type QuoteSubmission = QuotePricingSubmission & {
  requestType: QuoteRequestType;
  customer: CustomerSubmission;
};

type ValidationResult<T> = { success: true; value: T } | { success: false; error: string };

function trimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInteger(value: unknown, maximum: number): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= maximum;
}

function asRecord(input: unknown): Record<string, unknown> | null {
  return input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : null;
}

function validateQuotePricingCore(raw: Record<string, unknown>): ValidationResult<QuotePricingSubmission> {
  const serviceSlug = trimmedString(raw.serviceSlug);
  const serviceName = trimmedString(raw.serviceName);
  const product = trimmedString(raw.product);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(serviceSlug) || serviceSlug.length > 80) {
    return { success: false, error: "Selecione um serviço válido." };
  }
  if (!serviceName || serviceName.length > 120) {
    return { success: false, error: "O nome do serviço é obrigatório." };
  }
  if (!product || product.length > 80) {
    return { success: false, error: "Selecione um produto." };
  }
  if (!positiveInteger(raw.quantity, 100_000)) {
    return { success: false, error: "Informe uma quantidade entre 1 e 100.000 peças." };
  }

  // Aceita também o formato antigo de uma arte durante a atualização do formulário.
  const rawEngravings = Array.isArray(raw.engravings)
    ? raw.engravings
    : [{
        location: "Frente",
        logoWidthMm: raw.logoWidthMm,
        logoHeightMm: raw.logoHeightMm,
        colorCount: raw.colorCount,
        fileId: raw.fileId,
      }];
  if (rawEngravings.length < 1 || rawEngravings.length > 100) {
    return { success: false, error: "Inclua entre 1 e 100 gravações no pedido." };
  }

  const engravings: QuoteEngravingSubmission[] = [];
  for (const entry of rawEngravings) {
    const engraving = asRecord(entry);
    if (!engraving) return { success: false, error: "Confira os dados de cada gravação." };

    const location = trimmedString(engraving.location);
    const fileId = trimmedString(engraving.fileId);
    if (!location || location.length > 80) {
      return { success: false, error: "Informe o lado ou local de cada gravação." };
    }
    if (!positiveInteger(engraving.logoWidthMm, 1_000) || !positiveInteger(engraving.logoHeightMm, 1_000)) {
      return { success: false, error: "Informe largura e altura válidas para cada gravação, em milímetros." };
    }
    if (!positiveInteger(engraving.colorCount, 16)) {
      return { success: false, error: "Informe de 1 a 16 cores para cada gravação." };
    }
    if (fileId && fileId.length > 80) {
      return { success: false, error: "Um dos arquivos anexados é inválido." };
    }

    engravings.push({
      location,
      logoWidthMm: engraving.logoWidthMm,
      logoHeightMm: engraving.logoHeightMm,
      colorCount: engraving.colorCount,
      ...(fileId ? { fileId } : {}),
    });
  }

  return {
    success: true,
    value: { serviceSlug, serviceName, product, quantity: raw.quantity, engravings },
  };
}

export function validateQuotePricingSubmission(input: unknown): ValidationResult<QuotePricingSubmission> {
  const raw = asRecord(input);
  if (!raw) return { success: false, error: "Os dados do orçamento são inválidos." };
  return validateQuotePricingCore(raw);
}

export function validateQuoteSubmission(input: unknown): ValidationResult<QuoteSubmission> {
  const raw = asRecord(input);
  if (!raw) return { success: false, error: "Os dados do orçamento são inválidos." };

  const core = validateQuotePricingCore(raw);
  if (!core.success) return core;

  const requestType = raw.requestType;
  if (requestType !== "automatic" && requestType !== "whatsapp") {
    return { success: false, error: "Escolha uma forma válida de solicitar o orçamento." };
  }

  const customer = validateCustomerSubmission(raw.customer);
  if (!customer.success) {
    return { success: false, error: "Confira seus dados de contato. Informe nome, título, mensagem e um telefone ou celular válido." };
  }

  return {
    success: true,
    value: { ...core.value, requestType, customer: customer.value },
  };
}
