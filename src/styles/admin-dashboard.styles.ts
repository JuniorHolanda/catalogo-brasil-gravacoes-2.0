import styled from "styled-components";
import { cssTheme } from "@/styles/theme";
import { padding, radius } from "@/styles/mixins";

export const SAdminDashboard = styled.main`
  width: min(100%, 76rem);
  min-height: 100vh;
  margin: 0 auto;
  ${padding("md-2", "xl-2")}
  padding-bottom: calc(6rem + env(safe-area-inset-bottom));
  color: ${cssTheme.colors.text};

  h1 {
    margin: 0;
    font-size: clamp(1.7rem, 5vw, 2.6rem);
  }

  > p {
    color: ${cssTheme.colors.textMuted};
  }
`;

export const SAdminStats = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: var(--gap-md-2);
  margin: var(--space-lg-1) 0;
`;

export const SAdminStat = styled.article`
  display: grid;
  gap: var(--gap-sm-1);
  ${padding("md-2")}
  ${radius("md")}
  background: ${cssTheme.colors.surface};
  box-shadow: ${cssTheme.shadows.low};

  span {
    color: ${cssTheme.colors.textMuted};
    font-size: 0.86rem;
  }

  strong {
    font-size: 1.5rem;
    font-variant-numeric: tabular-nums;
  }
`;

export const SStorageProgress = styled.div<{ $percent: number }>`
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

export const SAdminSection = styled.section`
  display: grid;
  gap: var(--gap-sm-2);
  margin-top: var(--space-lg-1);

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

export const SAdminAlert = styled.article`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-sm-2);
  ${padding("md-2")}
  ${radius("md")}
  background: ${cssTheme.colors.surface};

  strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  span {
    color: ${cssTheme.colors.textMuted};
    font-size: 0.85rem;
  }
`;

export const SAdminStatus = styled.span<{ $pending: boolean }>`
  color: ${({ $pending }) => $pending ? cssTheme.colors.context.danger : cssTheme.colors.context.success} !important;
  font-weight: 800;
`;
