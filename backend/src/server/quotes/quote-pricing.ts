import "server-only";

import pricingTable from "@/server/quotes/pricing-table.json";
import type { QuoteEngravingSubmission } from "@/server/quotes/quote-validation";

type PricingTier = {
  minQuantity: number;
  maxQuantity: number | null;
  kind: "fixedBatch" | "perPiece";
  amountCents: number;
};

type PricingGroup = {
  id: string;
  products: string[];
  maxLogoWidthMm: number | null;
  maxLogoHeightMm: number;
  tiers: PricingTier[];
};

type PricingTable = {
  tableId: string;
  version: number;
  serviceSlug: string;
  currency: "BRL";
  baseColorCount: number;
  groups: PricingGroup[];
};

const table = pricingTable as PricingTable;

export type QuotePricingLine = {
  engravingNumber: number;
  location: string;
  pricingGroupId: string;
  tierMinQuantity: number;
  tierMaxQuantity: number | null;
  kind: PricingTier["kind"];
  quantity: number;
  amountCents: number;
  lineTotalCents: number;
};

export type QuotePricingSnapshot = {
  status: "calculated" | "manual-review";
  currency: "BRL";
  tableId?: string;
  tableVersion?: number;
  totalCents?: number;
  lines: QuotePricingLine[];
  reason?: string;
};

function manualReview(reason: string): QuotePricingSnapshot {
  return {
    status: "manual-review",
    currency: "BRL",
    lines: [],
    reason,
  };
}

/** Calcula apenas combinações cadastradas; o restante fica explícito para análise manual. */
export function calculateQuotePricing(input: {
  serviceSlug: string;
  product: string;
  quantity: number;
  engravings: QuoteEngravingSubmission[];
}): QuotePricingSnapshot {
  if (input.serviceSlug !== table.serviceSlug) {
    return manualReview("Ainda não há uma tabela automática configurada para este serviço.");
  }
  if (input.engravings.some((engraving) => engraving.colorCount !== table.baseColorCount)) {
    return {
      ...manualReview("A tabela atual cobre apenas gravações de uma cor."),
      tableId: table.tableId,
      tableVersion: table.version,
    };
  }

  const group = table.groups.find((candidate) => candidate.products.includes(input.product));
  if (!group) {
    return {
      ...manualReview("Este produto ainda não está cadastrado na tabela automática."),
      tableId: table.tableId,
      tableVersion: table.version,
    };
  }

  const lines: QuotePricingLine[] = [];
  for (const [index, engraving] of input.engravings.entries()) {
    if (
      (group.maxLogoWidthMm !== null && engraving.logoWidthMm > group.maxLogoWidthMm)
      || engraving.logoHeightMm > group.maxLogoHeightMm
    ) {
      return {
        ...manualReview(`A gravação ${index + 1} excede o tamanho máximo desta tabela.`),
        tableId: table.tableId,
        tableVersion: table.version,
      };
    }

    const tier = group.tiers.find((candidate) => (
      input.quantity >= candidate.minQuantity
      && (candidate.maxQuantity === null || input.quantity <= candidate.maxQuantity)
    ));
    if (!tier) {
      return {
        ...manualReview(`Não há uma faixa de quantidade para a gravação ${index + 1}.`),
        tableId: table.tableId,
        tableVersion: table.version,
      };
    }

    const lineTotalCents = tier.kind === "fixedBatch"
      ? tier.amountCents
      : tier.amountCents * input.quantity;
    lines.push({
      engravingNumber: index + 1,
      location: engraving.location,
      pricingGroupId: group.id,
      tierMinQuantity: tier.minQuantity,
      tierMaxQuantity: tier.maxQuantity,
      kind: tier.kind,
      quantity: input.quantity,
      amountCents: tier.amountCents,
      lineTotalCents,
    });
  }

  return {
    status: "calculated",
    currency: table.currency,
    tableId: table.tableId,
    tableVersion: table.version,
    totalCents: lines.reduce((total, line) => total + line.lineTotalCents, 0),
    lines,
  };
}
