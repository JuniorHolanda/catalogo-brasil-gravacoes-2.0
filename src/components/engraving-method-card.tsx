import Image from "next/image";
import engravingMethods from "@/data/engraving-methods.json";
import {
  SEngravingArtwork,
  SEngravingArtworkRings,
  SEngravingCardAction,
  SEngravingCardDescription,
  SEngravingCardLink,
  SEngravingCardTitle,
  SEngravingImageTile,
  SEngravingTagline,
} from "@/styles/engraving-methods.styles";

export type EngravingMethod = (typeof engravingMethods)[number];

type EngravingMethodCardProps = {
  method: EngravingMethod;
};

/** Renderiza um card de técnica com imagem e conteúdo vindos do catálogo JSON. */
export function EngravingMethodCard({ method }: EngravingMethodCardProps) {
  return (
    <SEngravingCardLink href={`/servicos/${method.slug}`}>
      <SEngravingArtwork>
        <SEngravingTagline>{method.tagline}</SEngravingTagline>
        <SEngravingArtworkRings data-layout={method.slug} aria-hidden="true" />
        <SEngravingImageTile>
          <Image src={method.image} alt={method.alt} fill sizes="80px" />
        </SEngravingImageTile>
      </SEngravingArtwork>

      <SEngravingCardTitle type="title" headingLevel="h3" size="xlg" weight={700}>
        <span>Gravação</span>
        <span>{method.name}</span>
      </SEngravingCardTitle>
      <SEngravingCardDescription type="paragraph" size="md" weight={700}>
        {method.description}
      </SEngravingCardDescription>
      <SEngravingCardAction>
        Orçamento <span aria-hidden="true">↗</span>
      </SEngravingCardAction>
    </SEngravingCardLink>
  );
}
