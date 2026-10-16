import "server-only";

export type QuoteRequestType = "automatic" | "whatsapp";

export type QuoteEngravingSubmission = {
  location: string;
  logoWidthMm: number;
  logoHeightMm: number;
  colorCount: number;
  fileId?: string;
};

export type QuoteSubmission = {
  serviceSlug: string;
  serviceName: string;
  requestType: QuoteRequestType;
  product: string;
  quantity: number;
  engravings: QuoteEngravingSubmission[];
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

  // Converte também o formato antigo de uma arte para o novo array durante a atualização.
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
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return { success: false, error: "Confira os dados de cada gravação." };
    }

    const engraving = entry as Record<string, unknown>;
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
    value: {
      serviceSlug,
      serviceName,
      requestType,
      product,
      quantity: raw.quantity,
      engravings,
    },
  };
}
