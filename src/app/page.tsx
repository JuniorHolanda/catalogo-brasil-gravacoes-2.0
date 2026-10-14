import { ThemeToggle } from "@/components/theme-toggle";
import { MobileStories } from "@/components/mobile-stories";
import {
  Brand,
  BrandMark,
  Card,
  CardDescription,
  CardHeading,
  CardKicker,
  CardTitle,
  Cards,
  Count,
  Description,
  Eyebrow,
  Footer,
  Header,
  Hero,
  Page,
  Palette,
  PaletteColor,
  Shell,
  SpacingBar,
  SpacingList,
  SpacingRow,
  Swatch,
  SwatchName,
  Title,
  TokenCode,
} from "@/styles/home.styles";
import type { PaletteToken, SpaceToken } from "@/styles/theme";
import { STORY_BACKGROUND_VARIANT_COUNT } from "@/lib/story-atmosphere";
import { FaGift, FaGit, FaGithub } from "react-icons/fa";

const paletteSwatches: {
  name: string;
  hex: string;
  background: PaletteToken;
  foreground: PaletteToken;
}[] = [
  { name: "Preto", hex: "#000000", background: "black", foreground: "white" },
  { name: "Azul-marinho", hex: "#002746", background: "navy", foreground: "white" },
  { name: "Pedra", hex: "#7D766A", background: "stone", foreground: "white" },
  { name: "Cinza", hex: "#D9D9D9", background: "gray", foreground: "black" },
  { name: "Âmbar", hex: "#DD932D", background: "amber", foreground: "black" },
  { name: "Creme", hex: "#F0E2CB", background: "cream", foreground: "black" },
  { name: "Branco", hex: "#FFFFFF", background: "white", foreground: "black" },
];

const spaceTokens = [
  "sm-1", "sm-2", "sm-3",
  "md-1", "md-2", "md-3",
  "lg-1", "lg-2", "lg-3",
  "xl-1", "xl-2", "xl-3",
  "xxl-1", "xxl-2", "xxl-3",
] satisfies SpaceToken[];

/** Apresenta a paleta de cores e a escala de espaçamentos configuradas no projeto. */
export default function Home() {
  // Sorteia o fundo no servidor para o mesmo visual chegar no HTML e na hidratação.
  const storyBackgroundVariant = Math.floor(Math.random() * STORY_BACKGROUND_VARIANT_COUNT);

  return (
    <Page>
      <Shell>
        <Header>
          <Brand aria-label="Brasil Gravações, início" href="/">
            <BrandMark aria-hidden="true">BG</BrandMark>
            <span>Brasil Gravações</span>
          </Brand>
          <ThemeToggle />
        </Header>

        <Hero aria-labelledby="page-title">
          <Eyebrow>Serigrafia criativa · Produção independente</Eyebrow>
          <Title id="page-title">Produtos que representam a identidade de cada cliente.</Title>
          <Description>
            Unimos técnica, criatividade e atenção aos detalhes para produzir peças
            originais, com qualidade em cada etapa.
          </Description>
        </Hero>

        <MobileStories backgroundVariant={storyBackgroundVariant} />

        <Footer>
          <div>Desenvolvido por
            <span><FaGithub /></span>
            <a href="#"><i><strong>Pedro Holanda</strong></i></a>
          </div>
        </Footer>
      </Shell>
    </Page>
  );
}
