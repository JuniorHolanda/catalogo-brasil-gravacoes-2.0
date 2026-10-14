"use client";

import styled from "styled-components";
import { useTheme } from "@/components/theme-provider";
import { flex, focusRing, radius, transition, visuallyHidden } from "@/styles/mixins";

const Button = styled.button`
  ${flex({ align: "center", justify: "center" })}
  ${radius("pill")}
  ${transition()}
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;

  &:hover {
    border-color: var(--color-accent);
  }

  ${focusRing()}
`;

const Icon = styled.span`
  font-size: 1.25rem;
  line-height: 1;
`;

const ScreenReaderOnly = styled.span`
  ${visuallyHidden()}
`;

/** Renderiza o botão acessível que alterna entre os temas claro e escuro. */
export function ThemeToggle() {
  const { isDark, setIsDark } = useTheme();
  /** Inverte o estado atual do tema ao acionar o botão. */
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Button
      aria-label="Alternar tema claro e escuro"
      aria-pressed={isDark}
      onClick={toggleTheme}
      type="button"
    >
      <Icon aria-hidden="true">◐</Icon>
      <ScreenReaderOnly>Alternar tema</ScreenReaderOnly>
    </Button>
  );
}
