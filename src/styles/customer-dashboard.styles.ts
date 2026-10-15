import styled from "styled-components";
import { cssTheme } from "@/styles/theme";
import { padding, radius } from "@/styles/mixins";

export const SCustomerPanel = styled.main`
  width: min(100%, 70rem);
  min-height: 100vh;
  margin: 0 auto;
  ${padding("md-2", "xl-2")}
  padding-bottom: calc(7rem + env(safe-area-inset-bottom));
  color: ${cssTheme.colors.text};

  @media (min-width: 761px) {
    padding-top: var(--space-xl-2);
    padding-bottom: var(--space-xl-2);
  }
`;

export const SCustomerPanelHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md-2);
  margin-bottom: var(--space-lg-1);

  h1 {
    margin: 0;
    font-size: clamp(1.6rem, 5vw, 2.5rem);
  }

  p {
    margin: var(--space-sm-1) 0 0;
    color: ${cssTheme.colors.textMuted};
  }

  a {
    color: ${cssTheme.colors.primary};
    font-weight: 700;
    text-underline-offset: 0.2em;
  }
`;

export const SUploadCard = styled.section`
  display: grid;
  gap: var(--gap-md-2);
  ${padding("md-2")}
  ${radius("lg")}
  background: ${cssTheme.colors.surface};
  box-shadow: ${cssTheme.shadows.low};

  h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    color: ${cssTheme.colors.textMuted};
    font-size: 0.92rem;
    line-height: 1.45;
  }
`;

export const SUploadButton = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  width: fit-content;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  ${padding("tb-sm-2", "lr-md-2")}
  ${radius("md")}
  color: ${cssTheme.colors.primaryText};
  background: ${cssTheme.colors.primary};
  font-weight: 800;
  cursor: ${({ $disabled }) => $disabled ? "not-allowed" : "pointer"};
  opacity: ${({ $disabled }) => $disabled ? 0.58 : 1};

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    clip-path: inset(50%);
  }

  &:focus-within {
    outline: 3px solid ${cssTheme.colors.focus};
    outline-offset: 2px;
  }
`;

export const SDailyUsage = styled.div`
  width: fit-content;
  ${padding("tb-sm-1", "lr-sm-2")}
  ${radius("pill")}
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surfaceMuted};
  font-size: 0.82rem;
  font-weight: 700;
`;

export const SFileSection = styled.section`
  display: grid;
  gap: var(--gap-sm-2);
  margin-top: var(--space-lg-1);

  h2 {
    margin: 0 0 var(--space-sm-1);
    font-size: 1.2rem;
  }
`;

export const SFileRow = styled.article`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-sm-2);
  ${padding("sm-2")}
  ${radius("md")}
  background: ${cssTheme.colors.surface};

  > div:first-child {
    display: grid;
    min-width: 0;
    gap: 0.2rem;
  }

  strong {
    overflow-wrap: anywhere;
  }

  span {
    color: ${cssTheme.colors.textMuted};
    font-size: 0.8rem;
  }
`;

export const SFileActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--gap-sm-1);
`;

export const SFileAction = styled.button`
  display: inline-flex;
  min-height: 2.4rem;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm-1);
  ${padding("tb-sm-1", "lr-sm-2")}
  ${radius("sm")}
  border: 1px solid ${cssTheme.colors.border};
  color: ${cssTheme.colors.text};
  background: ${cssTheme.colors.surface};
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  &:hover:not(:disabled) {
    background: ${cssTheme.colors.surfaceMuted};
  }
`;

export const SPanelNotice = styled.p<{ $error?: boolean }>`
  margin: 0;
  color: ${({ $error }) => $error ? cssTheme.colors.context.danger : cssTheme.colors.textMuted};
  font-size: 0.9rem;
`;
