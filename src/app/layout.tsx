import type { Metadata } from "next";
import { Baloo_Chettan_2, Dongle } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import "swiper/css";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import { MotionProvider } from "@/components/motion-provider";
import { StyledComponentsRegistry } from "@/components/styled-components-registry";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_COOKIE_NAME, type ThemePreference } from "@/lib/theme";
import { SGlobalStyles } from "@/styles/global-styles";
import { lightTheme, ThemeVariables } from "@/styles/theme";

const mainFont = Baloo_Chettan_2({
  weight: "variable",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-main",
});

const secondaryFont = Dongle({
  weight: ["300", "400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-secondary",
});

export const metadata: Metadata = {
  title: "Brasil Gravações | Serigrafia criativa",
  description:
    "Serigrafia criativa e produção independente, com técnica, qualidade e atenção aos detalhes para criar produtos que representam cada cliente.",
};

/** Lê a preferência salva no servidor e prepara estilos e tema antes de renderizar a página. */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieValue = (await cookies()).get(THEME_COOKIE_NAME)?.value;
  const initialPreference: ThemePreference =
    cookieValue === "light" || cookieValue === "dark" ? cookieValue : "system";

  return (
    <html
      lang="pt-BR"
      className={`${mainFont.variable} ${secondaryFont.variable}`}
      data-theme={initialPreference === "system" ? undefined : initialPreference}
    >
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider initialPreference={initialPreference}>
            <ThemeVariables theme={lightTheme} />
            <SGlobalStyles />
              <MotionProvider>
                {children}
                <MobileBottomNavigation />
              </MotionProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
