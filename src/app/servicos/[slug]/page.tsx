import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import engravingMethods from "@/data/engraving-methods.json";
import { createWhatsAppLink } from "@/lib/whatsapp";
import {
  SServiceBackLink,
  SServiceContent,
  SServiceDescription,
  SServiceDetails,
  SServiceImageFrame,
  SServiceKicker,
  SServicePage,
  SServicePanel,
  SServiceQuoteLink,
  SServiceTagline,
  SServiceTitle,
} from "@/styles/service-detail.styles";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

/** Informa ao Next.js quais páginas de serviço podem ser geradas a partir do catálogo. */
export function generateStaticParams() {
  return engravingMethods.map(({ slug }) => ({ slug }));
}

/** Prepara título e descrição de busca usando os dados do serviço correspondente. */
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = engravingMethods.find((item) => item.slug === slug);

  if (!service) {
    return { title: "Serviço não encontrado | Brasil Gravações" };
  }

  return {
    title: `${service.name} | Brasil Gravações`,
    description: service.description,
  };
}

/** Renderiza a página no servidor; dados de usuário e valores calculados não vêm do catálogo público. */
export default async function ServicePageRoute({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = engravingMethods.find((item) => item.slug === slug);

  if (!service) notFound();

  return (
    <SServicePage>
      <SServiceBackLink href="/#engraving-methods-title">
        <span aria-hidden="true">←</span> Todos os serviços
      </SServiceBackLink>

      <SServicePanel>
        <SServiceImageFrame>
          <Image
            src={service.image}
            alt={service.alt}
            fill
            priority
            sizes="(max-width: 720px) 100vw, 50vw"
          />
        </SServiceImageFrame>

        <SServiceContent>
          <SServiceKicker type="paragraph" size="sm" weight={800}>
            Processo de gravação
          </SServiceKicker>
          <SServiceTitle type="title" headingLevel="h1" size="xxl" weight={700}>
            {service.name}
          </SServiceTitle>
          <SServiceTagline type="paragraph" size="xlg" weight={400}>
            {service.tagline}
          </SServiceTagline>
          <SServiceDescription type="paragraph" size="lg" weight={700}>
            {service.description}
          </SServiceDescription>
          <SServiceDetails type="paragraph" size="md" weight={400}>
            {service.details}
          </SServiceDetails>
          <SServiceQuoteLink
            href={createWhatsAppLink(service.name)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversar sobre este serviço <span aria-hidden="true">↗</span>
          </SServiceQuoteLink>
        </SServiceContent>
      </SServicePanel>
    </SServicePage>
  );
}
