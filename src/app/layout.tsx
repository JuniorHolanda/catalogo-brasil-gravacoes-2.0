import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import "swiper/css";
import { StyledComponentsRegistry } from "@/components/styled-components-registry";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_COOKIE_NAME, type ThemePreference } from "@/lib/theme";
import { GlobalStyles } from "@/styles/global-styles";

export const metadata: Metadata = {
  title: "Brasil Gravações | Início",
  description: "Plataforma Brasil Gravações.",
};

/** Lê a preferência salva no servidor e prepara estilos e tema antes de renderizar a página. */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieValue = (await cookies()).get(THEME_COOKIE_NAME)?.value;
  const initialPreference: ThemePreference =
    cookieValue === "light" || cookieValue === "dark" ? cookieValue : "system";

  return (
    <html
      lang="pt-BR"
      data-theme={initialPreference === "system" ? undefined : initialPreference}
    >
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <ThemeProvider initialPreference={initialPreference}>
            {children}
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
