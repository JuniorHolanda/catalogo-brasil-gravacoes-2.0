import type { CSSProperties } from "react";
import { css } from "styled-components";
import type { SpaceToken } from "@/styles/theme";

export type FlexAlignment = "top" | "center" | "bottom";
export type FlexDirection = "row" | "column";

export type FlexOptions = {
  align?: FlexAlignment;
  crossAlign?: CSSProperties["alignItems"];
  direction?: FlexDirection;
  gap?: SpaceToken;
  justify?: CSSProperties["justifyContent"];
  position?: CSSProperties["position"];
  wrap?: CSSProperties["flexWrap"];
};

const alignments: Record<FlexAlignment, string> = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
};

/** Cria regras flex com alinhamento tipado, direção em linha ou coluna e posição opcional. */
export function flex({
  align = "top",
  crossAlign,
  direction = "row",
  gap,
  justify,
  position,
  wrap,
}: FlexOptions = {}) {
  return css`
    display: flex;
    flex-direction: ${direction};
    ${direction === "column"
      ? css`justify-content: ${alignments[align]};`
      : css`align-items: ${alignments[align]};`}
    ${crossAlign ? css`align-items: ${crossAlign};` : ""}
    ${gap ? css`gap: var(--gap-${gap});` : ""}
    ${justify ? css`justify-content: ${justify};` : ""}
    ${position ? css`position: ${position};` : ""}
    ${wrap ? css`flex-wrap: ${wrap};` : ""}
  `;
}

export type RadiusToken = "none" | "sm" | "md" | "lg" | "pill";

/** Aplica o raio de borda definido pelo token informado. */
export function radius(size: RadiusToken = "md") {
  return css`
    border-radius: var(--radius-${size});
  `;
}

export type ElevationLevel = "low" | "medium" | "high";

/** Aplica a sombra correspondente ao nível de elevação escolhido. */
export function elevation(level: ElevationLevel = "low") {
  return css`
    box-shadow: var(--shadow-${level});
  `;
}

/** Padroniza a transição de cores e sombra usando uma duração permitida. */
export function transition(duration: "120ms" | "180ms" | "240ms" = "180ms") {
  return css`
    transition:
      background-color ${duration} ease,
      color ${duration} ease,
      border-color ${duration} ease,
      box-shadow ${duration} ease;
  `;
}

/** Exibe um contorno de foco visível para navegação por teclado. */
export function focusRing() {
  return css`
    &:focus-visible {
      outline: 3px solid var(--color-focus);
      outline-offset: 3px;
    }
  `;
}

/** Oculta conteúdo visualmente sem removê-lo da leitura por tecnologias assistivas. */
export function visuallyHidden() {
  return css`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
}
