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
          <Eyebrow>Base visual do projeto</Eyebrow>
          <Title id="page-title">Uma base consistente para cada tela.</Title>
          <Description>
            Cores, espaçamentos e estilos reutilizáveis para construir a experiência
            da Brasil Gravações com clareza desde o primeiro componente.
          </Description>
        </Hero>

        <MobileStories />

        <Cards>
          <Card aria-labelledby="palette-title">
            <CardHeading>
              <div>
                <CardKicker>01 / Identidade</CardKicker>
                <CardTitle id="palette-title">Paleta de cores</CardTitle>
              </div>
              <Count>07 cores</Count>
            </CardHeading>
            <Palette>
              {/* Renderiza uma amostra visual para cada cor da paleta. */}
              {paletteSwatches.map((color) => (
                <Swatch key={color.background}>
                  <PaletteColor
                    $background={color.background}
                    $foreground={color.foreground}
                  >
                    Aa
                  </PaletteColor>
                  <SwatchName>{color.name}</SwatchName>
                  <TokenCode>{color.hex}</TokenCode>
                </Swatch>
              ))}
            </Palette>
          </Card>

          <Card aria-labelledby="spacing-title">
            <CardHeading>
              <div>
                <CardKicker>02 / Ritmo</CardKicker>
                <CardTitle id="spacing-title">Escala de espaçamento</CardTitle>
              </div>
              <Count>05 níveis</Count>
            </CardHeading>
            <CardDescription>
              Margin, padding e gap apontam para a mesma escala de medidas.
            </CardDescription>
            <SpacingList>
              {/* Mostra o nome, a proporção e a variável CSS de cada espaçamento. */}
              {spaceTokens.map((token) => (
                <SpacingRow key={token}>
                  <TokenCode>{token}</TokenCode>
                  <SpacingBar $token={token} />
                  <TokenCode>{"var(--space-" + token + ")"}</TokenCode>
                </SpacingRow>
              ))}
            </SpacingList>
          </Card>

        </Cards>

        <Footer>
          <span>Tokens preparados para uso global</span>
          <span>Claro · Escuro · Sistema</span>
        </Footer>
      </Shell>
    </Page>
  );
}
