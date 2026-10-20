import styled from "styled-components";
import { cssTheme } from "@/styles/theme";
import { font, padding, radius } from "@/styles/mixins";

export const SDashboardPage = styled.main`
  width: min(100%, 78rem);
  min-height: 100vh;
  margin: 0 auto;
  ${padding("md-2", "xl-2")}
  padding-bottom: calc(3rem + env(safe-area-inset-bottom));
  color: ${cssTheme.colors.text};

  h1 {
    margin: 0;
    ${font("title-lg")}
  }

  > p {
    margin-top: var(--space-sm-2);
    color: ${cssTheme.colors.textMuted};
  }
`;

export const SDashboardHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md-2);
  margin-bottom: var(--space-lg-1);
`;

export const SDashboardBrand = styled.div`
  display: flex;
  align-items: center;
  gap: var(--gap-sm-2);

  > span {
    display: grid;
    width: 2.8rem;
    aspect-ratio: 1;
    place-items: center;
    ${radius("pill")}
    color: ${cssTheme.colors.primaryText};
    background: ${cssTheme.colors.primary};
    font-weight: 800;
  }

  > div {
    display: grid;
  }

  strong {
    ${font("text-lg")}
  }

  small {
    color: ${cssTheme.colors.textMuted};
  }
`;

export const SDashboardButton = styled.button`
  min-height: 2.65rem;
  ${padding("tb-sm-1", "lr-md-2")}
  ${radius("md")}
  border: 1px solid ${cssTheme.colors.border};
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};
  font: inherit;
  ${font("text-md")}
  font-weight: 700;
  cursor: pointer;

  &:hover { background: ${cssTheme.colors.surfaceMuted}; }
  &:disabled { opacity: 0.55; cursor: wait; }
`;

export const SDashboardStats = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--gap-md-2);
  margin: var(--space-lg-1) 0;
`;

export const SDashboardStat = styled.article`
  display: grid;
  gap: var(--gap-sm-1);
  ${padding("md-2")}
  ${radius("md")}
  background: ${cssTheme.colors.surface};
  box-shadow: ${cssTheme.shadows.low};

  span { color: ${cssTheme.colors.textMuted}; ${font("text-md")} }
  strong { ${font("text-xl")} font-variant-numeric: tabular-nums; }
`;

export const SDashboardSection = styled.section`
  display: grid;
  gap: var(--gap-sm-2);
  margin-top: var(--space-lg-1);

  > h2 { margin: 0 0 var(--space-sm-1); ${font("title-sm")} }
`;

export const SDashboardCard = styled.article`
  display: grid;
  gap: var(--gap-sm-1);
  ${padding("md-2")}
  ${radius("md")}
  background: ${cssTheme.colors.surface};
  box-shadow: ${cssTheme.shadows.low};

  > header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--gap-sm-1);
  }

  strong { ${font("text-lg")} }
  span { color: ${cssTheme.colors.textMuted}; ${font("text-sm")} }
  p { margin: 0; }
`;

export const SDashboardNotice = styled.p<{ $error?: boolean }>`
  margin: 0;
  ${padding("md-2")}
  ${radius("md")}
  color: ${({ $error }) => $error ? cssTheme.colors.context.danger : cssTheme.colors.textMuted};
  background: ${cssTheme.colors.surface};
  ${font("text-md")}
`;

export const SDashboardProgress = styled.div<{ $percent: number }>`
  height: 0.65rem;
  overflow: hidden;
  ${radius("pill")}
  background: ${cssTheme.colors.surfaceMuted};

  &::after {
    display: block;
    width: ${({ $percent }) => `${$percent}%`};
    height: 100%;
    ${radius("pill")}
    background: ${({ $percent }) => $percent >= 100
      ? cssTheme.colors.context.danger
      : $percent >= (5 / 9 * 100)
        ? cssTheme.colors.accent
        : cssTheme.colors.context.success};
    content: "";
  }
`;

export const SLoginBackdrop = styled.main`
  display: grid;
  min-height: 100vh;
  place-items: center;
  ${padding("md-2")}
  background: ${cssTheme.colors.background};
`;

export const SLoginCard = styled.section`
  display: grid;
  width: min(100%, 29rem);
  gap: var(--gap-md-2);
  ${padding("xl-2")}
  ${radius("lg")}
  background: ${cssTheme.colors.surface};
  box-shadow: ${cssTheme.shadows.high};

  h1 { margin: 0; ${font("title-md")} }
  p { margin: 0; color: ${cssTheme.colors.textMuted}; }

  form { display: grid; gap: var(--gap-sm-2); }
  label { display: grid; gap: var(--gap-sm-1); font-weight: 700; }
  input {
    width: 100%;
    min-height: 2.9rem;
    ${padding("tb-sm-1", "lr-sm-2")}
    ${radius("sm")}
    border: 1px solid ${cssTheme.colors.border};
    color: ${cssTheme.colors.text};
    background: ${cssTheme.colors.background};
    font: inherit;
  }
  input:focus-visible { outline: 3px solid ${cssTheme.colors.focus}; outline-offset: 2px; }
`;
