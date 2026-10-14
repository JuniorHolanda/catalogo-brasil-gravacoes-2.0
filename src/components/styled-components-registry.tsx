"use client";

import { useState, type ReactNode } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

/** Registra e injeta os estilos do styled-components durante a renderização no servidor. */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  // Mantém uma folha de estilos isolada para esta árvore de componentes.
  const [styleSheet] = useState(() => new ServerStyleSheet());

  // Injeta os estilos coletados no HTML e limpa a folha para a próxima inserção.
  useServerInsertedHTML(() => {
    const styles = styleSheet.getStyleElement();
    styleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") {
    return <>{children}</>;
  }

  return <StyleSheetManager sheet={styleSheet.instance}>{children}</StyleSheetManager>;
}
