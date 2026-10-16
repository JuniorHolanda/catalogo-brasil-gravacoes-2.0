import { NextResponse } from "next/server";
import engravingMethods from "@brasil-gravacoes/domain/services";
import quotePricing from "@/server/quotes/pricing-table.json";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const service = engravingMethods.find((item) => item.slug === slug);
  if (!service) return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  const productLogoLimits = service.slug === quotePricing.serviceSlug
    ? Object.fromEntries(quotePricing.groups.flatMap((group) => group.products.map((product) => [
        product,
        { maxWidthMm: group.maxLogoWidthMm, maxHeightMm: group.maxLogoHeightMm },
      ])))
    : undefined;
  return NextResponse.json({ service: { ...service, productLogoLimits } });
}
