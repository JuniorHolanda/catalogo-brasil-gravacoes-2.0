import styled from "styled-components";
import { elevation, flex, radius } from "@/styles/mixins";
import { palette, space } from "@/styles/theme";
import type { PaletteToken, SpaceToken } from "@/styles/theme";

export const Page = styled.main`
  ${flex({ direction: "column", align: "top" })}
  width: 100%;
  min-height: 100vh;
  padding: var(--padding-md-3) max(var(--padding-md-3), calc((100vw - 68rem) / 2));
  background: var(--color-background);
`;

export const Shell = styled.div`
  width: 100%;
  max-width: 68rem;
  margin-inline: auto;
`;

export const Header = styled.header`
  ${flex({ align: "center", justify: "space-between", gap: "md-2" })}
  min-height: 3rem;
  padding: var(--padding-sm-2) var(--padding-md-2);
`;

export const Brand = styled.a`
  ${flex({ align: "center", gap: "sm-2" })}
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const BrandMark = styled.span`
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  ${radius("sm")}
  color: var(--color-primary-text);
  background: var(--color-primary);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
`;

export const Hero = styled.section`
  ${flex({ direction: "column", align: "top", gap: "md-3" })}
  max-width: 47rem;
  padding-block: var(--padding-xl-1) var(--padding-lg-3);

  @media (max-width: 760px) {
    padding-block: var(--padding-lg-3);
  }
`;

export const Eyebrow = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  max-width: 44rem;
  margin: 0;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: 600;
  letter-spacing: -0.065em;
  line-height: 0.98;
  text-wrap: balance;
`;

export const Description = styled.p`
  max-width: 38rem;
  margin: 0;
  color: var(--color-text-muted);
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.7;
`;

export const Cards = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: var(--gap-md-3);

  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Card = styled.section`
  min-width: 0;
  padding: var(--padding-lg-2);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  ${radius("lg")}
  ${elevation("low")}

  @media (max-width: 480px) {
    padding: var(--padding-md-3);
  }
`;

export const CardHeading = styled.div`
  ${flex({ align: "top", justify: "space-between", gap: "md-1" })}
  margin-bottom: var(--margin-lg-2);
`;

export const CardKicker = styled(Eyebrow)`
  margin-bottom: var(--margin-sm-2);
  font-size: 0.65rem;
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  letter-spacing: -0.04em;
`;

export const Count = styled.span`
  flex: none;
  padding: var(--padding-sm-1) var(--padding-sm-2);
  ${radius("pill")}
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  font-size: 0.7rem;
  font-weight: 700;
`;

export const Palette = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--gap-md-2) var(--gap-sm-2);

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const Swatch = styled.div`
  ${flex({ direction: "column", align: "top", gap: "sm-1" })}
  min-width: 0;
`;

type PaletteColorProps = {
  $background: PaletteToken;
  $foreground: PaletteToken;
};

// As funções de interpolação selecionam cores da paleta por tokens tipados.
export const PaletteColor = styled.div<PaletteColorProps>`
  display: grid;
  min-height: 4rem;
  place-items: center;
  border: 1px solid var(--color-border);
  ${radius("sm")}
  color: ${({ $foreground }) => palette[$foreground]};
  background: ${({ $background }) => palette[$background]};
  font-size: 1.25rem;
  font-weight: 700;
`;

export const SwatchName = styled.span`
  overflow: hidden;
  font-size: 0.72rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TokenCode = styled.code`
  color: var(--color-text-muted);
  font-family: "Courier New", monospace;
  font-size: 0.65rem;
`;

export const CardDescription = styled.p`
  margin: calc(-1 * var(--margin-md-2)) 0 var(--margin-md-2);
  color: var(--color-text-muted);
  font-size: 0.86rem;
  line-height: 1.5;
`;

export const SpacingList = styled.div`
  display: grid;
  gap: var(--gap-sm-2);
`;

export const SpacingRow = styled.div`
  display: grid;
  grid-template-columns: 3.25rem minmax(0, 8rem) minmax(0, 1fr);
  min-height: 1.1rem;
  align-items: center;
  gap: var(--gap-sm-2);

  ${TokenCode}:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type SpacingBarProps = { $token: SpaceToken };

// A interpolação converte o token recebido na variável CSS de espaçamento.
export const SpacingBar = styled.span<SpacingBarProps>`
  display: block;
  width: ${({ $token }) => space($token)};
  max-width: 100%;
  height: 0.45rem;
  ${radius("pill")}
  background: var(--color-accent);
`;

export const Footer = styled.footer`
  ${flex({ align: "center", justify: "space-between", gap: "sm-2", wrap: "wrap" })}
  margin-top: var(--margin-xl-1);
  padding-top: var(--padding-md-2);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.75rem;
`;
