import { createTheme } from "styled-components";

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
  success: "#718575",
  danger: "#F04444",
} as const;

export type PaletteToken = keyof typeof palette;
export type ThemeMode = "light" | "dark";

type ThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfacePanel: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentText: string;
  focus: string;
  context: {
    success: string;
    danger: string;
    pending: string;
  };
};

const radii = {
  none: "0",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  pill: "999px",
} as const;

type ThemeShadows = {
  low: string;
  medium: string;
  high: string;
  navigation: string;
};

const lightShadows: ThemeShadows = {
  low: `0 1px 2px color-mix(in srgb, ${palette.black} 8%, transparent)`,
  medium: `0 12px 32px color-mix(in srgb, ${palette.black} 12%, transparent)`,
  high: `0 24px 64px color-mix(in srgb, ${palette.black} 18%, transparent)`,
  navigation: `0 -0.25rem 0.75rem color-mix(in srgb, ${palette.black} 12%, transparent)`,
};

const darkShadows: ThemeShadows = {
  low: `0 1px 2px color-mix(in srgb, ${palette.black} 28%, transparent)`,
  medium: `0 12px 32px color-mix(in srgb, ${palette.black} 36%, transparent)`,
  high: `0 24px 64px color-mix(in srgb, ${palette.black} 48%, transparent)`,
  navigation: `0 -0.25rem 0.75rem color-mix(in srgb, ${palette.black} 36%, transparent)`,
};

export type AppTheme = {
  mode: ThemeMode;
  palette: typeof palette;
  spacing: typeof spacing;
  margin: typeof spacing;
  padding: typeof spacing;
  gap: typeof spacing;
  colors: ThemeColors;
  radii: typeof radii;
  shadows: ThemeShadows;
};

const sharedTheme = {
  palette,
  spacing,
  // Estes aliases compartilham intencionalmente a mesma escala de espaçamento.
  margin: spacing,
  padding: spacing,
  gap: spacing,
  radii,
};

export const lightTheme: AppTheme = {
  ...sharedTheme,
  mode: "light",
  shadows: lightShadows,
  colors: {
    background: palette.cream,
    surface: palette.white,
    surfaceMuted: palette.cream,
    surfacePanel: palette.stone,
    text: palette.navy,
    textMuted: palette.navy,
    border: palette.gray,
    primary: palette.navy,
    primaryText: palette.white,
    accent: palette.amber,
    accentText: palette.black,
    focus: palette.amber,
    context: {
      success: palette.success,
      danger: palette.danger,
      pending: palette.stone,
    },
  },
};

export const darkTheme: AppTheme = {
  ...sharedTheme,
  mode: "dark",
  shadows: darkShadows,
  colors: {
    background: palette.black,
    surface: palette.navy,
    surfaceMuted: palette.black,
    surfacePanel: palette.navy,
    text: palette.white,
    textMuted: palette.cream,
    border: palette.stone,
    primary: palette.amber,
    primaryText: palette.black,
    accent: palette.amber,
    accentText: palette.black,
    focus: palette.cream,
    context: {
      success: palette.success,
      danger: palette.danger,
      pending: palette.stone,
    },
  },
};

const cssThemeDefinition = createTheme(lightTheme);

/** Usa referências CSS estáveis para que o tema também funcione em Server Components. */
export const cssTheme = cssThemeDefinition as unknown as AppTheme;
export const ThemeVariables = cssThemeDefinition.GlobalStyle;

type ThemeRecord = Record<string, unknown>;

/** Gera as declarações que substituem somente os tokens alterados no tema escuro. */
function collectThemeOverrides(
  values: ThemeRecord,
  baseValues: ThemeRecord,
  variableNames: ThemeRecord,
): string[] {
  return Object.entries(values).flatMap(([key, value]) => {
    const baseValue = baseValues[key];
    const variableName = variableNames[key];

    if (
      value !== null && typeof value === "object" && !Array.isArray(value) &&
      baseValue !== null && typeof baseValue === "object" && !Array.isArray(baseValue) &&
      variableName !== null && typeof variableName === "object" && !Array.isArray(variableName)
    ) {
      return collectThemeOverrides(
        value as ThemeRecord,
        baseValue as ThemeRecord,
        variableName as ThemeRecord,
      );
    }

    if (value !== baseValue && typeof variableName === "string") {
      return [`${variableName}: ${String(value)};`];
    }

    return [];
  });
}

export const darkThemeOverrides = collectThemeOverrides(
  darkTheme as unknown as ThemeRecord,
  lightTheme as unknown as ThemeRecord,
  cssThemeDefinition.vars as unknown as ThemeRecord,
).join("\n");

/** Converte um token de espaçamento em uma referência à variável CSS correspondente. */
export function space(token: SpaceToken): string {
  return `var(--space-${token})`;
}
