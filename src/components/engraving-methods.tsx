import engravingMethods from '@brasil-gravacoes/domain/services';
import { EngravingMethodsCarousel } from '@/components/engraving-methods-carousel';
import {
  SEngravingCarouselViewport,
  SEngravingSection,
  SEngravingSectionDescription,
  SEngravingSectionHeader,
  SEngravingSectionKicker,
  SEngravingSectionTitle,
} from '@/styles/engraving-methods.styles';

/** Gera os cards pelo catálogo público, incluindo a regra futura de pré-orçamento por técnica. */
export function EngravingMethods() {
  return (
    <SEngravingSection id="servicos" aria-labelledby="engraving-methods-title">
      <SEngravingSectionHeader>
        <SEngravingSectionKicker type="paragraph" size="sm" weight={700}>
          Conheça nossos serviços
        </SEngravingSectionKicker>
        <SEngravingSectionTitle
          type="title"
          headingLevel="h2"
          size="xl"
          weight={700}
          id="engraving-methods-title"
        >
          Uma técnica para cada ideia
        </SEngravingSectionTitle>
        <SEngravingSectionDescription type="paragraph" size="lg" weight={400}>
          Conheça nossos processos de serigrafia e gravação. Cada projeto recebe
          atenção aos detalhes e orientação adequada ao material.
        </SEngravingSectionDescription>
      </SEngravingSectionHeader>

      <SEngravingCarouselViewport>
        <EngravingMethodsCarousel methods={engravingMethods} />
      </SEngravingCarouselViewport>
    </SEngravingSection>
  );
}
