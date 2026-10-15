import { cssTheme } from "@/styles/theme";
import type { CSSProperties } from "react";
import { css } from "styled-components";
import type { SpaceToken, SpacingScale } from "@/styles/theme";

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

export type PaddingDirection = "t" | "l" | "r" | "b" | "tb" | "lr";
export type PaddingSize = "none" | SpacingScale | SpaceToken;
export type PaddingUnit =
  | PaddingSize
  | `${PaddingDirection}-${PaddingSize}`;
export type PaddingSafeAreaEdge = "top" | "left" | "right" | "bottom";

export type PaddingOptions = {
  /** Soma a área segura do dispositivo às bordas indicadas. */
  safeArea?: readonly PaddingSafeAreaEdge[];
};

const paddingDirections: Record<PaddingDirection, readonly PaddingSafeAreaEdge[]> = {
  t: ["top"],
  l: ["left"],
  r: ["right"],
  b: ["bottom"],
  tb: ["top", "bottom"],
  lr: ["left", "right"],
};

const paddingEdges: readonly PaddingSafeAreaEdge[] = ["top", "right", "bottom", "left"];

/**
 * Aplica um token nas quatro bordas ou nas bordas indicadas.
 * Sem etapa explícita, usa a opção intermediária; `none` zera as bordas indicadas.
 */
export function padding(...unitsAndOptions: Array<PaddingUnit | PaddingOptions>) {
  const lastArgument = unitsAndOptions[unitsAndOptions.length - 1];
  const hasOptions = typeof lastArgument === "object" && lastArgument !== null;
  const options = hasOptions ? lastArgument as PaddingOptions : {};
  const units = hasOptions
    ? unitsAndOptions.slice(0, -1) as PaddingUnit[]
    : unitsAndOptions as PaddingUnit[];
  const edgeTokens: Partial<Record<PaddingSafeAreaEdge, string>> = {};

  for (const unit of units) {
    const parts = unit.split("-");
    const hasDirection = parts.length > 1 && ["t", "l", "r", "b", "tb", "lr"].includes(parts[0]);
    const direction = hasDirection ? parts.shift() as PaddingDirection : undefined;
    const token = parts.join("-");
    const [scale, step = "2"] = token.split("-");
    const edges = direction ? paddingDirections[direction] : paddingEdges;

    const value = scale === "none" ? "0" : `var(--padding-${scale}-${step})`;

    for (const edge of edges) edgeTokens[edge] = value;
  }

  const declarations = paddingEdges
    .filter((edge) => edgeTokens[edge])
    .map((edge) => {
      const token = edgeTokens[edge]!;
      const safeArea = options.safeArea?.includes(edge)
        ? `calc(${token} + env(safe-area-inset-${edge}))`
        : token;
      return `padding-${edge}: ${safeArea};`;
    });

  return css`${declarations.join("\n")}`;
}

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
export type RadiusDirection = "t" | "l" | "r" | "b" | "tb" | "lr";
export type RadiusUnit = RadiusToken | `${RadiusDirection}-${RadiusToken}`;

const radiusCorners: Record<RadiusDirection, readonly string[]> = {
  t: ["top-left", "top-right"],
  l: ["top-left", "bottom-left"],
  r: ["top-right", "bottom-right"],
  b: ["bottom-left", "bottom-right"],
  tb: ["top-left", "top-right", "bottom-right", "bottom-left"],
  lr: ["top-left", "top-right", "bottom-right", "bottom-left"],
};

/** Aplica o raio em todos os cantos ou somente nos lados indicados. */
export function radius(...units: RadiusUnit[]) {
  const cornerTokens: Record<string, RadiusToken> = {};
  const corners = ["top-left", "top-right", "bottom-right", "bottom-left"];

  for (const unit of units.length ? units : ["md"]) {
    const [direction, token] = unit.includes("-")
      ? unit.split("-") as [RadiusDirection, RadiusToken]
      : [undefined, unit as RadiusToken];
    const affectedCorners = direction ? radiusCorners[direction] : corners;

    for (const corner of affectedCorners) cornerTokens[corner] = token;
  }

  const declarations = corners
    .filter((corner) => cornerTokens[corner])
    .map((corner) => `border-${corner}-radius: var(--radius-${cornerTokens[corner]});`);

  return css`${declarations.join("\n")}`;
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
      outline: 3px solid ${cssTheme.colors.focus};
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
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  `;
}
