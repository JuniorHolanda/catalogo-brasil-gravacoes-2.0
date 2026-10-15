"use client";

import { cssTheme } from "@/styles/theme";

import styled from "styled-components";
import { useTheme } from "@/components/theme-provider";
import { flex, focusRing, radius, transition, visuallyHidden } from "@/styles/mixins";

const SButton = styled.button`
  ${flex({ align: "center", justify: "center" })}
  ${radius("pill")}
  ${transition()}
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid ${cssTheme.colors.border};
  background: ${cssTheme.colors.surface};
  color: ${cssTheme.colors.text};
  cursor: pointer;

  &:hover {
    border-color: ${cssTheme.colors.accent};
  }

  ${focusRing()}
`;

const SIcon = styled.span`
  font-size: 1.25rem;
  line-height: 1;
`;

const SScreenReaderOnly = styled.span`
  ${visuallyHidden()}
`;

/** Renderiza o botão acessível que alterna entre os temas claro e escuro. */
export function ThemeToggle() {
  const { isDark, setIsDark } = useTheme();
  /** Inverte o estado atual do tema ao acionar o botão. */
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <SButton
      aria-label="Alternar tema claro e escuro"
      aria-pressed={isDark}
      onClick={toggleTheme}
      type="button"
    >
      <SIcon aria-hidden="true">◐</SIcon>
      <SScreenReaderOnly>Alternar tema</SScreenReaderOnly>
    </SButton>
  );
}
