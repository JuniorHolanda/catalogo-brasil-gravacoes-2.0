export type QuoteRequestType = "automatic" | "whatsapp";

export type QuoteSubmission = {
  serviceSlug: string;
  serviceName: string;
  requestType: QuoteRequestType;
  product: string;
  quantity: number;
  logoWidthMm: number;
  logoHeightMm: number;
  colorCount: number;
  fileId?: string;
};

function trimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInteger(value: unknown, maximum: number): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= maximum;
}

export function validateQuoteSubmission(input: unknown):
  | { success: true; value: QuoteSubmission }
  | { success: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, error: "Os dados do orçamento são inválidos." };
  }

  const raw = input as Record<string, unknown>;
  const serviceSlug = trimmedString(raw.serviceSlug);
  const serviceName = trimmedString(raw.serviceName);
  const product = trimmedString(raw.product);
  const requestType = raw.requestType;
  const fileId = trimmedString(raw.fileId);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(serviceSlug) || serviceSlug.length > 80) {
    return { success: false, error: "Selecione um serviço válido." };
  }
  if (!serviceName || serviceName.length > 120) {
    return { success: false, error: "O nome do serviço é obrigatório." };
  }
  if (requestType !== "automatic" && requestType !== "whatsapp") {
    return { success: false, error: "Escolha uma forma válida de solicitar o orçamento." };
  }
  if (!product || product.length > 80) {
    return { success: false, error: "Selecione um produto." };
  }
  if (!positiveInteger(raw.quantity, 100_000)) {
    return { success: false, error: "Informe uma quantidade entre 1 e 100.000 peças." };
  }
  if (!positiveInteger(raw.logoWidthMm, 1_000) || !positiveInteger(raw.logoHeightMm, 1_000)) {
    return { success: false, error: "Informe largura e altura válidas, em milímetros." };
  }
  if (!positiveInteger(raw.colorCount, 16)) {
    return { success: false, error: "Informe de 1 a 16 cores." };
  }
  if (fileId && fileId.length > 80) {
    return { success: false, error: "O arquivo anexado é inválido." };
  }

  return {
    success: true,
    value: {
      serviceSlug,
      serviceName,
      requestType,
      product,
      quantity: raw.quantity,
      logoWidthMm: raw.logoWidthMm,
      logoHeightMm: raw.logoHeightMm,
      colorCount: raw.colorCount,
      ...(fileId ? { fileId } : {}),
    },
  };
}
