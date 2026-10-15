import { createGlobalStyle } from "styled-components";
import { cssTheme, darkThemeOverrides, spacing } from "@/styles/theme";
import { padding } from "@/styles/mixins";

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

export const SGlobalStyles = createGlobalStyle`
  :root {
    color-scheme: ${cssTheme.mode};
    ${spacingVariables}
    ${spacingAliases}
    --radius-none: ${cssTheme.radii.none};
    --radius-sm: ${cssTheme.radii.sm};
    --radius-md: ${cssTheme.radii.md};
    --radius-lg: ${cssTheme.radii.lg};
    --radius-pill: ${cssTheme.radii.pill};
    --shadow-low: ${cssTheme.shadows.low};
    --shadow-medium: ${cssTheme.shadows.medium};
    --shadow-high: ${cssTheme.shadows.high};
  }

  :root[data-theme="dark"] {
    ${darkThemeOverrides}
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      ${darkThemeOverrides}
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: 0;
  }

  html,
  body {
    min-height: 100%;
  }

  html {
    background: ${cssTheme.colors.background};
    scroll-behavior: smooth;
  }

  body {
    min-width: 320px;
    color: ${cssTheme.colors.text};
    background: ${cssTheme.colors.background};
    font-family: var(--font-main), Arial, Helvetica, sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 180ms ease, color 180ms ease;
  }

  @media (max-width: 760px) {
    body {
      ${padding('b-xl-1', { safeArea: ["bottom"] })}
    }
  }

  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-secondary), sans-serif;
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
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 3px;
  }

  ::selection {
    color: ${cssTheme.colors.primaryText};
    background: ${cssTheme.colors.primary};
  }
`;
