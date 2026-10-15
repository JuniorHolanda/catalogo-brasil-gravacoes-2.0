import { css, styled } from "styled-components";

export type TextSize = "sm" | "md" | "lg" | "xlg" | "xxl";
export type TextWeight =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | "normal"
  | "bold"
  | "lighter"
  | "bolder";

type TextStyleProps = {
  $size: TextSize;
  $weight: TextWeight;
};

// Cada escala de título mantém proporções próprias para o tamanho escolhido.
const titleSizes: Record<TextSize, string> = {
  sm: "clamp(1.25rem, 3vw, 1.5rem)",
  md: "clamp(2rem, 3.5vw, 2rem)",
  lg: "clamp(1.75rem, 4vw, 2.5rem)",
  xlg: "clamp(2.25rem, 5vw, 3.5rem)",
  xxl: "clamp(2.5rem, 7vw, 5.5rem)",
};

// A escala de parágrafo é menor para manter a hierarquia visual do conteúdo.
const paragraphSizes: Record<TextSize, string> = {
  sm: "0.75rem",
  md: "0.875rem",
  lg: "clamp(1rem, 2.4vw, 1.2rem)",
  xlg: "clamp(1.125rem, 3vw, 1.5rem)",
  xxl: "clamp(1.25rem, 3.5vw, 1.75rem)",
};

/** Seleciona na escala de títulos o tamanho pedido pelo componente. */
function getTitleSize({ $size }: TextStyleProps) {
  return titleSizes[$size];
}

/** Seleciona na escala de parágrafos o tamanho pedido pelo componente. */
function getParagraphSize({ $size }: TextStyleProps) {
  return paragraphSizes[$size];
}

/** Retorna o peso tipográfico escolhido sem encaminhar props internas ao HTML. */
function getFontWeight({ $weight }: TextStyleProps) {
  return $weight;
}

const titleTextStyles = css<TextStyleProps>`
  font-size: ${getTitleSize};
  font-weight: ${getFontWeight};
  line-height: 1.2;
`;

export const STextH1 = styled.h1<TextStyleProps>`
  ${titleTextStyles}
`;

export const STextH2 = styled.h2<TextStyleProps>`
  ${titleTextStyles}
`;

export const STextH3 = styled.h3<TextStyleProps>`
  ${titleTextStyles}
`;

export const STextParagraph = styled.p<TextStyleProps>`
  font-size: ${getParagraphSize};
  font-weight: ${getFontWeight};
  line-height: 1.45;
`;
