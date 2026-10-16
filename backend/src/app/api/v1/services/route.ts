import { NextResponse } from "next/server";
import engravingMethods from "@brasil-gravacoes/domain/services";
import quotePricing from "@/server/quotes/pricing-table.json";

export async function GET() {
  const services = engravingMethods.map((service) => ({
    ...service,
    productLogoLimits: service.slug === quotePricing.serviceSlug
      ? Object.fromEntries(quotePricing.groups.flatMap((group) => group.products.map((product) => [
          product,
          { maxWidthMm: group.maxLogoWidthMm, maxHeightMm: group.maxLogoHeightMm },
        ])))
      : undefined,
  }));
  return NextResponse.json({ services });
}
