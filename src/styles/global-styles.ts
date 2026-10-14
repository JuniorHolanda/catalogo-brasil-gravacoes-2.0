import { createGlobalStyle, css } from "styled-components";
import { darkTheme, lightTheme, palette, spacing } from "@/styles/theme";
import type { AppTheme } from "@/styles/theme";

// Gera as variáveis CSS para cada medida da escala compartilhada.
const spacingVariables = Object.entries(spacing)
  .flatMap(([scale, steps]) =>
    Object.entries(steps).map(([step, value]) => `--space-${scale}-${step}: ${value};`),
  )
  .join("\n");

// Cria aliases de margin, padding e gap apontando para a escala única.
const spacingAliases = (["margin", "padding", "gap"] as const)
  .flatMap((alias) =>
    Object.entries(spacing).flatMap(([scale, steps]) =>
      Object.keys(steps).map(
        (step) => `--${alias}-${scale}-${step}: var(--space-${scale}-${step});`,
      ),
    ),
  )
  .join("\n");

// Expõe todas as cores da paleta como variáveis CSS globais.
const paletteVariables = Object.entries(palette)
  .map(([name, value]) => `--palette-${name}: ${value};`)
  .join("\n");

/** Monta as variáveis semânticas CSS a partir do tema recebido. */
const themeVariables = (theme: AppTheme) => css`
  --color-background: ${theme.tokens.background};
  --color-surface: ${theme.tokens.surface};
  --color-surface-muted: ${theme.tokens.surfaceMuted};
  --color-text: ${theme.tokens.text};
  --color-text-muted: ${theme.tokens.textMuted};
  --color-border: ${theme.tokens.border};
  --color-primary: ${theme.tokens.primary};
  --color-primary-text: ${theme.tokens.primaryText};
  --color-accent: ${theme.tokens.accent};
  --color-accent-text: ${theme.tokens.accentText};
  --color-focus: ${theme.tokens.focus};
`;

export const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: light;
    ${spacingVariables}
    ${spacingAliases}
    ${paletteVariables}
    --radius-none: ${lightTheme.radii.none};
    --radius-sm: ${lightTheme.radii.sm};
    --radius-md: ${lightTheme.radii.md};
    --radius-lg: ${lightTheme.radii.lg};
    --radius-pill: ${lightTheme.radii.pill};
    --shadow-low: ${lightTheme.shadows.low};
    --shadow-medium: ${lightTheme.shadows.medium};
    --shadow-high: ${lightTheme.shadows.high};
    ${themeVariables(lightTheme)}
  }

  :root[data-theme="light"] {
    color-scheme: light;
    ${themeVariables(lightTheme)}
  }

  :root[data-theme="dark"] {
    color-scheme: dark;
    ${themeVariables(darkTheme)}
    --shadow-low: 0 1px 2px rgb(0 0 0 / 28%);
    --shadow-medium: 0 12px 32px rgb(0 0 0 / 36%);
    --shadow-high: 0 24px 64px rgb(0 0 0 / 48%);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      color-scheme: dark;
      ${themeVariables(darkTheme)}
      --shadow-low: 0 1px 2px rgb(0 0 0 / 28%);
      --shadow-medium: 0 12px 32px rgb(0 0 0 / 36%);
      --shadow-high: 0 24px 64px rgb(0 0 0 / 48%);
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    min-height: 100%;
    margin: 0;
  }

  html {
    background: var(--color-background);
    scroll-behavior: smooth;
  }

  body {
    min-width: 320px;
    color: var(--color-text);
    background: var(--color-background);
    font-family: Arial, Helvetica, sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 180ms ease, color 180ms ease;
  }

  button,
  a {
    color: inherit;
    font: inherit;
  }

  a {
    text-decoration: none;
  }

  button:focus-visible,
  a:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }

  ::selection {
    color: var(--color-primary-text);
    background: var(--color-primary);
  }
`;
