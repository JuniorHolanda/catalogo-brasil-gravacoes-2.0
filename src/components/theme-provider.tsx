"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { saveThemePreference } from "@/app/actions/theme";
import type { ThemePreference } from "@/lib/theme";
import { darkTheme, lightTheme } from "@/styles/theme";

type ThemeContextValue = {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  useSystemTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  initialPreference: ThemePreference;
};

/** Inscreve uma função nas mudanças da preferência de tema do sistema. */
function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  // Remove a inscrição quando o consumidor deixa de observar a preferência.
  return () => media.removeEventListener("change", onChange);
}

/** Lê no navegador se o sistema está usando o tema escuro. */
function getSystemThemeSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Fornece um valor inicial estável durante a renderização no servidor. */
function getSystemThemeServerSnapshot() {
  return false;
}

/** Compartilha o tema ativo e os comandos de troca com toda a árvore da aplicação. */
export function ThemeProvider({ children, initialPreference }: ThemeProviderProps) {
  const [preference, setPreference] = useState(initialPreference);
  const systemIsDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot,
  );
  const isDark = preference === "system" ? systemIsDark : preference === "dark";
  const activeTheme = isDark ? darkTheme : lightTheme;

  // Mantém o atributo do documento alinhado à preferência explícita ou ao sistema.
  useEffect(() => {
    if (preference === "system") {
      document.documentElement.removeAttribute("data-theme");
      return;
    }

    document.documentElement.dataset.theme = preference;
  }, [preference]);

  /** Define o tema claro ou escuro e salva a escolha do usuário. */
  const setIsDark = useCallback((nextIsDark: boolean) => {
    const nextPreference: ThemePreference = nextIsDark ? "dark" : "light";
    setPreference(nextPreference);
    document.documentElement.dataset.theme = nextPreference;
    // Mantém a troca visual imediata mesmo se a gravação da preferência falhar.
    void saveThemePreference(nextPreference).catch(() => undefined);
  }, []);

  /** Retorna ao tema do sistema e remove a preferência explícita salva. */
  const useSystemTheme = useCallback(() => {
    setPreference("system");
    document.documentElement.removeAttribute("data-theme");
    // Mantém a troca visual imediata mesmo se a gravação da preferência falhar.
    void saveThemePreference("system").catch(() => undefined);
  }, []);

  // Memoriza o valor do contexto para evitar atualizações sem mudança de estado.
  const value = useMemo(
    () => ({ isDark, setIsDark, useSystemTheme }),
    [isDark, setIsDark, useSystemTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={activeTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

/** Recupera o contexto de tema e informa se o provider estiver ausente. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  }

  return context;
}
