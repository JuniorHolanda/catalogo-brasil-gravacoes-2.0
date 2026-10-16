import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import engravingMethods from "@/data/engraving-methods.json";
import quotePricing from "@/server/quotes/pricing-table.json";
import { ServiceOrderForm } from "@/components/service-order-form";
import { SiteFooter } from "@/components/site-footer";
import {
  SServiceBackLink,
  SServicePage,
} from "@/styles/service-detail.styles";
import {
  SServiceBanner,
  SServiceBannerCopy,
  SServiceInformation,
} from "@/styles/service-order.styles";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

/** Gera uma rota para cada serviço do catálogo; serviços novos já entram nesse fluxo. */
export function generateStaticParams() {
  return engravingMethods.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = engravingMethods.find((item) => item.slug === slug);

  if (!service) return { title: "Serviço não encontrado | Brasil Gravações" };

  return {
    title: `Orçamento de ${service.name} | Brasil Gravações`,
    description: service.description,
  };
}

export default async function ServicePageRoute({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = engravingMethods.find((item) => item.slug === slug);
  if (!service) notFound();
  const productLogoLimits = service.slug === quotePricing.serviceSlug
    ? Object.fromEntries(quotePricing.groups.flatMap((group) => group.products.map((product) => [
        product,
        { maxWidthMm: group.maxLogoWidthMm, maxHeightMm: group.maxLogoHeightMm },
      ] as const)))
    : undefined;

  return (
    <SServicePage key={service.slug}>
      <SServiceBackLink href="/#servicos">
        <span aria-hidden="true">←</span> Todos os serviços
      </SServiceBackLink>

      <SServiceBanner>
        <Image
          src={service.image}
          alt={service.alt}
          fill
          priority
          sizes="(max-width: 720px) 100vw, 72rem"
        />
        <SServiceBannerCopy>
          <p>Orçamento do serviço</p>
          <h1>{service.name}</h1>
        </SServiceBannerCopy>
      </SServiceBanner>

      <ServiceOrderForm
        key={service.slug}
        service={{
          slug: service.slug,
          name: service.name,
          supportsPreQuote: service.supportsPreQuote,
          products: service.products,
          productLogoLimits,
        }}
      />

      <SServiceInformation>
        <h2>{service.tagline}</h2>
        <p>{service.description}</p>
        <p>{service.details}</p>
      </SServiceInformation>
      <SiteFooter />
    </SServicePage>
  );
}
