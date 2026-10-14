# Brasil Gravações

Projeto Next.js com App Router, TypeScript e styled-components.

## Tema e estilos

- `src/styles/theme.ts` define os temas claro e escuro, a paleta e a escala de medidas.
- As 15 medidas usam os níveis `sm`, `md`, `lg`, `xl` e `xxl`, com três opções em cada nível.
- `margin`, `padding` e `gap` compartilham a mesma escala. No CSS, use, por exemplo, `var(--space-md-2)`, `var(--margin-md-2)`, `var(--padding-md-2)` ou `var(--gap-md-2)`.
- `src/styles/mixins.ts` contém mixins tipados para flex, radius, elevação, foco, transições e texto acessível.
- `src/styles/global-styles.ts` publica as variáveis CSS e aplica os estilos globais.

Exemplo de componente:

```tsx
import styled from "styled-components";
import { elevation, flex, radius } from "@/styles/mixins";

export const Card = styled.section`
  ${flex({ direction: "column", align: "top", gap: "md-2" })}
  ${radius("lg")}
  ${elevation("low")}
  padding: var(--padding-md-3);
  color: var(--color-text);
  background: var(--color-surface);
`;
```

O mixin `flex` aceita alinhamento `top`, `center` ou `bottom`, direção `row` ou `column` e a propriedade opcional `position`, tipada conforme CSS.

## Troca de tema

O `ThemeProvider` em `src/components/theme-provider.tsx` expõe um contexto global:

```tsx
const { isDark, setIsDark, useSystemTheme } = useTheme();

setIsDark(true);       // tema escuro
setIsDark(false);      // tema claro
useSystemTheme();      // volta a acompanhar o sistema
```

Sem escolha salva, CSS aplica `prefers-color-scheme` já no primeiro paint. Uma escolha manual é renderizada no servidor a partir do cookie `bg-theme`, evitando uma troca visual durante a hidratação. O cookie é validado no Server Action e usa `HttpOnly`, `SameSite=Lax` e `Secure` em produção.

`src/components/styled-components-registry.tsx` coleta e insere os estilos durante o SSR do App Router. O compilador do Next está configurado para styled-components em `next.config.ts`.

## Segurança inicial

O Next envia `X-Content-Type-Options`, `X-Frame-Options` e `Referrer-Policy`; em produção, também envia HSTS. Esses cabeçalhos são uma base da aplicação. Endpoints de autenticação, autorização e pagamento devem definir seus próprios controles quando forem implementados.

## Desenvolvimento

```bash
npm install
npm run dev
```

O build de produção pode ser executado com `npm run build`.
