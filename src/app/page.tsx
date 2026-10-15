import { ThemeToggle } from "@/components/theme-toggle";
import { MobileStories } from "@/components/mobile-stories";
import { EngravingMethods } from "@/components/engraving-methods";
import { CompanyValues } from "@/components/company-values";
import { SiteFooter } from "@/components/site-footer";
import {
  SBrand,
  SBrandMark,

  SDescription,
  SEyebrow,
  SHeader,
  SHero,
  SPage,
  SShell,

  STitle,
} from "@/styles/home.styles";

/** Apresenta a paleta de cores e a escala de espaçamentos configuradas no projeto. */
export default function Home() {
  return (
    <SPage>
      <SShell>
        <SHeader>
          <SBrand aria-label="Brasil Gravações, início" href="/">
            <SBrandMark aria-hidden="true">BG</SBrandMark>
            <span>Brasil Gravações</span>
          </SBrand>
          <ThemeToggle />
        </SHeader>

        <SHero aria-labelledby="page-title">
          <SEyebrow type="paragraph" size="sm" weight={700}>
            Serigrafia criativa · Produção independente
          </SEyebrow>
          <STitle type="title" headingLevel="h1" size="xxl" weight={600} id="page-title">
            Produtos que representam a identidade de cada cliente.
          </STitle>
          <SDescription type="paragraph" size="lg" weight={400}>
            Unimos técnica, criatividade e atenção aos detalhes para produzir peças
            originais, com qualidade em cada etapa.
          </SDescription>
        </SHero>

        <MobileStories />

        <EngravingMethods />

        <CompanyValues />

        <SiteFooter />
      </SShell>
    </SPage>
  );
}
