import type { ReactNode } from "react";
import type { TextSize, TextWeight } from "@/styles/text.styles";
import {
  STextH1,
  STextH2,
  STextH3,
  STextParagraph,
} from "@/styles/text.styles";

export type TextType = "title" | "paragraph";
export type TextHeadingLevel = "h1" | "h2" | "h3";

type TextBaseProps = {
  size: TextSize;
  weight: TextWeight;
  children: ReactNode;
  id?: string;
  className?: string;
};

export type TextProps =
  | (TextBaseProps & { type: "title"; headingLevel: TextHeadingLevel })
  | (TextBaseProps & { type: "paragraph"; headingLevel?: never });

/** Renderiza um título h1, h2 ou h3, ou um parágrafo com a escala tipográfica escolhida. */
export function Text(props: TextProps) {
  if (props.type === "paragraph") {
    return (
      <STextParagraph
        $size={props.size}
        $weight={props.weight}
        id={props.id}
        className={props.className}
      >
        {props.children}
      </STextParagraph>
    );
  }

  const titleProps = {
    $size: props.size,
    $weight: props.weight,
    id: props.id,
    className: props.className,
    children: props.children,
  };

  switch (props.headingLevel) {
    case "h1":
      return <STextH1 {...titleProps} />;
    case "h2":
      return <STextH2 {...titleProps} />;
    case "h3":
      return <STextH3 {...titleProps} />;
    default:
      throw new Error("Nível de título inválido.");
  }
}
