export const spacing = {
  sm: { 1: "0.25rem", 2: "0.5rem", 3: "0.75rem" },
  md: { 1: "1rem", 2: "1.25rem", 3: "1.5rem" },
  lg: { 1: "2rem", 2: "2.5rem", 3: "3rem" },
  xl: { 1: "4rem", 2: "4.5rem", 3: "5rem" },
  xxl: { 1: "6rem", 2: "7rem", 3: "8rem" },
} as const;

export type SpacingScale = keyof typeof spacing;
export type SpaceStep = 1 | 2 | 3;
export type SpaceToken = `${SpacingScale}-${SpaceStep}`;

export const palette = {
  black: "#000000",
  navy: "#002746",
  stone: "#7D766A",
  gray: "#D9D9D9",
  amber: "#DD932D",
  cream: "#F0E2CB",
  white: "#FFFFFF",
} as const;

export type PaletteToken = keyof typeof palette;
export type ThemeMode = "light" | "dark";

const semanticColors = {
  background: "var(--color-background)",
  surface: "var(--color-surface)",
  surfaceMuted: "var(--color-surface-muted)",
  text: "var(--color-text)",
  textMuted: "var(--color-text-muted)",
  border: "var(--color-border)",
  primary: "var(--color-primary)",
  primaryText: "var(--color-primary-text)",
  accent: "var(--color-accent)",
  accentText: "var(--color-accent-text)",
  focus: "var(--color-focus)",
} as const;

const radii = {
  none: "0",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  pill: "999px",
} as const;

const shadows = {
  low: "0 1px 2px rgb(0 0 0 / 8%)",
  medium: "0 12px 32px rgb(0 0 0 / 12%)",
  high: "0 24px 64px rgb(0 0 0 / 18%)",
} as const;

type SemanticColorTokens = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentText: string;
  focus: string;
};

export type AppTheme = {
  mode: ThemeMode;
  palette: typeof palette;
  spacing: typeof spacing;
  margin: typeof spacing;
  padding: typeof spacing;
  gap: typeof spacing;
  colors: typeof semanticColors;
  tokens: SemanticColorTokens;
  radii: typeof radii;
  shadows: typeof shadows;
};

const sharedTheme = {
  palette,
  spacing,
  // Estes aliases compartilham intencionalmente a mesma escala de espaçamento.
  margin: spacing,
  padding: spacing,
  gap: spacing,
  colors: semanticColors,
  radii,
  shadows,
};

export const lightTheme: AppTheme = {
  ...sharedTheme,
  mode: "light",
  tokens: {
    background: palette.cream,
    surface: palette.white,
    surfaceMuted: palette.cream,
    text: palette.navy,
    textMuted: palette.navy,
    border: palette.gray,
    primary: palette.navy,
    primaryText: palette.white,
    accent: palette.amber,
    accentText: palette.black,
    focus: palette.amber,
  },
};

export const darkTheme: AppTheme = {
  ...sharedTheme,
  mode: "dark",
  tokens: {
    background: palette.black,
    surface: palette.navy,
    surfaceMuted: palette.black,
    text: palette.white,
    textMuted: palette.cream,
    border: palette.stone,
    primary: palette.amber,
    primaryText: palette.black,
    accent: palette.amber,
    accentText: palette.black,
    focus: palette.cream,
  },
};

/** Converte um token de espaçamento em uma referência à variável CSS correspondente. */
export function space(token: SpaceToken): string {
  return `var(--space-${token})`;
}
