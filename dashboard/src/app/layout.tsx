import type { Metadata } from "next";
import { Baloo_Chettan_2, Dongle } from "next/font/google";
import type { ReactNode } from "react";
import { StyledComponentsRegistry } from "@/components/styled-components-registry";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: "Painel | Brasil Gravações",
  description: "Área administrativa da Brasil Gravações.",
  robots: { index: false, follow: false, noarchive: true, googleBot: { index: false, follow: false, noarchive: true } },
};

export default function DashboardRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${mainFont.variable} ${secondaryFont.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider initialPreference="light">
            <ThemeVariables theme={lightTheme} />
            <SGlobalStyles />
            {children}
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
