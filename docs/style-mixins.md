# Mixins de estilo

Este documento cataloga as funções reutilizáveis exportadas por [`src/styles/mixins.ts`](../src/styles/mixins.ts). Elas retornam regras CSS do `styled-components` e podem ser interpoladas dentro de um template de estilo.

```tsx
import styled from "styled-components";
import { font, padding, radius } from "@/styles/mixins";

const SCard = styled.section`
  ${font("text-md")}
  ${padding("md-2")}
  ${radius("lg")}
`;
```

## Regra para novos mixins

Sempre que uma nova função reutilizável for exportada de `src/styles/mixins.ts` — ou de outro módulo com o mesmo propósito — atualize este catálogo na mesma alteração. Documente a assinatura, os parâmetros e valores padrão, os tokens aceitos, o CSS gerado, eventuais efeitos de ordem ou sobrescrita e um exemplo real de uso. Remova ou atualize a entrada quando um mixin mudar ou deixar de existir.

## Tokens usados

- `SpaceToken` combina uma escala (`sm`, `md`, `lg`, `xl` ou `xxl`) com uma etapa (`1`, `2` ou `3`), como `md-2`. `PaddingSize` também aceita uma escala sem etapa; nesse caso, `padding` usa a etapa `2`.
- Tokens de raio: `none`, `sm`, `md`, `lg` e `pill`.
- Níveis de elevação: `low`, `medium` e `high`.
- `gap` em `flex` recebe um `SpaceToken` e usa a variável CSS `--gap-*`.

## Catálogo

### `font(variant)`

Aplica um tamanho tipográfico compartilhado. Use variantes `text-*` para corpo, rótulos e microtexto e `title-*` para títulos. As escalas principais são `sm`, `md`, `lg`, `xl` e `xxl`; `text-2xs` e `text-xs` cobrem microtexto. As variantes `text-fluid-*` e `title-fluid-*` mantêm os tamanhos responsivos por contêiner usados nos cards de gravação. `title-display` atende ao valor de destaque do preview de orçamento.

```tsx
${font("text-sm")}
${font("text-md")}
${font("text-lg")}
${font("title-sm")}
${font("title-xl")}
```

| Variant | `font-size` |
| --- | --- |
| `text-2xs` | `0.65rem` |
| `text-xs` | `0.7rem` |
| `text-sm` | `0.75rem` |
| `text-md` | `0.875rem` |
| `text-lg` | `clamp(1rem, 2.4vw, 1.2rem)` |
| `text-xl` | `clamp(1.125rem, 3vw, 1.5rem)` |
| `text-xxl` | `clamp(1.25rem, 3.5vw, 1.75rem)` |
| `text-fluid-sm` / `text-fluid-md` | `clamp(0.75rem, 5.2cqi, 1rem)` / `clamp(0.9rem, 6cqi, 1.15rem)` |
| `title-sm` | `clamp(1.25rem, 3vw, 1.5rem)` |
| `title-md` | `clamp(1.5rem, 3.5vw, 2rem)` |
| `title-lg` | `clamp(1.75rem, 4vw, 2.5rem)` |
| `title-xl` | `clamp(2.25rem, 5vw, 3.5rem)` |
| `title-xxl` | `clamp(2.5rem, 7vw, 5.5rem)` |
| `title-display` | `clamp(2.4rem, 12vw, 4.6rem)` |
| `title-fluid-sm` / `title-fluid-lg` | `clamp(1.35rem, 10cqi, 2.1rem)` / `clamp(1.35rem, 14cqi, 3.2rem)` |

Use este mixin no lugar de declarar `font-size` diretamente nos estilos da interface para manter os tamanhos centralizados. Tipo relacionado: `FontVariant`.

### `padding(...unitsAndOptions)`

Gera declarações `padding-*` para as quatro bordas ou para lados selecionados.

| Forma | Bordas afetadas |
| --- | --- |
| `"md-2"` | Todas |
| `"md"` | Todas, usando a etapa `2` |
| `"none"` | Todas, com valor `0` |
| `"t-md-2"` / `"b-md-2"` | Superior / inferior |
| `"l-md-2"` / `"r-md-2"` | Esquerda / direita |
| `"tb-md-2"` / `"lr-md-2"` | Superior e inferior / esquerda e direita |

O último argumento pode ser `PaddingOptions`. `safeArea` soma `env(safe-area-inset-*)` às bordas indicadas, útil em dispositivos com áreas seguras. Só são emitidas declarações para as bordas selecionadas pelos tokens. Se tokens se sobrepõem, o último valor informado para cada borda prevalece.

```tsx
${padding("md-2", "tb-lg-1", { safeArea: ["bottom"] })}
```

Tipos relacionados: `PaddingDirection`, `PaddingSize`, `PaddingUnit`, `PaddingSafeAreaEdge` e `PaddingOptions`.

### `flex(options = {})`

Cria um contêiner flexível. Opções:

| Opção | Padrão | Efeito |
| --- | --- | --- |
| `direction` | `"row"` | Define `flex-direction`: `row` ou `column`. |
| `align` | `"top"` | Mapeia `top`, `center` e `bottom` para `flex-start`, `center` e `flex-end`. Em `row`, define `align-items`; em `column`, define `justify-content`. |
| `crossAlign` | — | Define `align-items` diretamente e prevalece sobre o valor produzido por `align`. |
| `gap` | — | Usa `var(--gap-<token>)`, por exemplo `md-2`. |
| `justify` | — | Define `justify-content` diretamente. Em `column`, prevalece sobre o valor de `align`. |
| `position` | — | Define `position`. |
| `wrap` | — | Define `flex-wrap`. |

```tsx
${flex({ direction: "column", align: "center", gap: "md-2", crossAlign: "stretch" })}
```

Tipos relacionados: `FlexAlignment`, `FlexDirection` e `FlexOptions`.

### `radius(...units)`

Aplica raios de borda com os tokens `none`, `sm`, `md`, `lg` e `pill`. Sem argumentos, usa `md` em todos os cantos. Um token simples, como `"lg"`, vale para os quatro cantos. Os prefixos `t`, `b`, `l` e `r` selecionam os cantos dos lados superior, inferior, esquerdo e direito. `tb` e `lr` também selecionam os quatro cantos.

Quando várias unidades afetam o mesmo canto, a última unidade prevalece.

```tsx
${radius("lg", "t-sm")}
```

O exemplo aplica raio `lg` a todos os cantos e depois sobrescreve os dois cantos superiores com `sm`.

Tipos relacionados: `RadiusToken`, `RadiusDirection` e `RadiusUnit`.

### `elevation(level = "low")`

Aplica `box-shadow: var(--shadow-<level>)`. Aceita `low`, `medium` ou `high`.

```tsx
${elevation("medium")}
```

Tipo relacionado: `ElevationLevel`.

### `transition(duration = "180ms")`

Cria transições com `ease` para `background-color`, `color`, `border-color` e `box-shadow`. A duração deve ser `120ms`, `180ms` ou `240ms`.

```tsx
${transition("240ms")}
```

### `focusRing()`

Aplica um contorno de foco em `:focus-visible`, usando a cor `focus` do tema, largura de `3px` e afastamento de `3px`. É destinado à navegação por teclado.

```tsx
${focusRing()}
```

### `visuallyHidden()`

Oculta visualmente o elemento mantendo-o disponível para tecnologias assistivas. Define posicionamento absoluto, área de `1px`, recorte, ausência de quebra de linha e borda.

```tsx
const SAccessibleLabel = styled.span`
  ${visuallyHidden()}
`;
```
