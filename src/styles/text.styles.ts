import { css, styled } from "styled-components";
import { font, type FontVariant } from "@/styles/mixins";

export type TextSize = "sm" | "md" | "lg" | "xl" | "xxl";
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

const titleVariants: Record<TextSize, FontVariant> = {
  sm: "title-sm",
  md: "title-md",
  lg: "title-lg",
  xl: "title-xl",
  xxl: "title-xxl",
};

const paragraphVariants: Record<TextSize, FontVariant> = {
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
  xl: "text-xl",
  xxl: "text-xxl",
};

function getFontWeight({ $weight }: TextStyleProps) {
  return $weight;
}

const titleTextStyles = css<TextStyleProps>`
  ${({ $size }) => font(titleVariants[$size])}
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
  ${({ $size }) => font(paragraphVariants[$size])}
  font-weight: ${getFontWeight};
  line-height: 1.45;
`;
