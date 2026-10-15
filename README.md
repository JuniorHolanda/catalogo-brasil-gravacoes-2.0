# Brasil Gravações

Projeto Next.js com App Router, TypeScript e styled-components.

## Tema e estilos

- `src/styles/theme.ts` define os temas claro e escuro, a paleta e a escala de medidas.
- As 15 medidas usam os níveis `sm`, `md`, `lg`, `xl` e `xxl`, com três opções em cada nível.
- `margin`, `padding` e `gap` compartilham a mesma escala. No CSS, use, por exemplo, `var(--space-md-2)`, `var(--margin-md-2)`, `var(--padding-md-2)` ou `var(--gap-md-2)`.
- `src/styles/mixins.ts` contém mixins tipados para flex, radius, elevação, foco, transições e texto acessível.
- `src/styles/global-styles.ts` publica as escalas de espaçamento e aplica os estilos globais.

Exemplo de componente:

```tsx
import styled from "styled-components";
import { elevation, flex, radius } from "@/styles/mixins";

export const Card = styled.section`
  ${flex({ direction: "column", align: "top", gap: "md-2" })}
  ${radius("lg")}
  ${elevation("low")}
  padding: var(--padding-md-3);
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`;
```

Use `theme.colors.context.success`, `theme.colors.context.danger` e `theme.colors.context.pending` para cores associadas a estados. As variáveis CSS ficam reservadas às escalas de espaçamento, raio e elevação.

O mixin `flex` aceita alinhamento `top`, `center` ou `bottom`, direção `row` ou `column` e a propriedade opcional `position`, tipada conforme CSS.

## Troca de tema

O `ThemeProvider` em `src/components/theme-provider.tsx` expõe um contexto global:

```tsx
const { isDark, setIsDark, useSystemTheme } = useTheme();

setIsDark(true);       // tema escuro
setIsDark(false);      // tema claro
useSystemTheme();      // volta a acompanhar o sistema
```

Sem escolha salva, o navegador sincroniza o tema do sistema durante a hidratação. Uma escolha manual é renderizada no servidor a partir do cookie `bg-theme`. O cookie é validado no Server Action e usa `HttpOnly`, `SameSite=Lax` e `Secure` em produção.

`src/components/styled-components-registry.tsx` coleta e insere os estilos durante o SSR do App Router. O compilador do Next está configurado para styled-components em `next.config.ts`.

## Segurança inicial

O Next envia `X-Content-Type-Options`, `X-Frame-Options` e `Referrer-Policy`; em produção, também envia HSTS. Esses cabeçalhos são uma base da aplicação. Endpoints de autenticação, autorização e pagamento devem definir seus próprios controles quando forem implementados.

## Cadastros de clientes no MongoDB Atlas

O cadastro será recebido pela rota de servidor `POST /api/customers`. Ela valida os campos e grava um documento na coleção `customers`, dentro do banco `brasil-gravacoes` (ou do nome definido em `MONGODB_DB`). A coleção e seu validador são criados na primeira gravação; cada documento começa com status `new` e recebe datas de criação e atualização.

Os campos armazenados são `name`, `company`, `phone`, `mobile`, `cnpj`, `title` e `message`. Telefone, celular e CNPJ são armazenados somente com dígitos. Nome, título, mensagem e pelo menos um telefone/celular são obrigatórios; empresa e CNPJ podem ficar vazios.

O Next.js executa a rota no servidor e mantém o pool de conexões do driver MongoDB. O navegador envia os dados ao endpoint; ele nunca recebe a URI nem conecta diretamente ao Atlas. O Atlas continua hospedando os dados, enquanto o código da aplicação contém a validação e a definição da coleção.

Para configurar localmente, copie `.env.example` para `.env.local` e preencha `MONGODB_URI` com a URI do Atlas e uma senha que não tenha sido compartilhada. `.env.local` já é ignorado pelo Git. Configure também as variáveis no ambiente de produção. Como a credencial foi publicada em uma conversa, revogue-a no Atlas e crie outra antes de conectar. O usuário de banco precisa de permissão de leitura e escrita no banco escolhido, e o Atlas precisa permitir a conexão de rede do ambiente onde o Next estiver publicado.

## Contas de clientes e uploads privados no Cloudflare R2

Better Auth oferece cadastro e login por e-mail/senha e Google. Usuários e sessões ficam no MongoDB Atlas; o campo `role` começa como `customer` e não pode ser enviado pelo formulário de cadastro. A rota `/painel` exige uma sessão autenticada. A rota `/admin` exige sessão e `role: "admin"`; clientes sem esse papel recebem 404. Para liberar o primeiro administrador, crie a própria conta e altere o campo `role` desse usuário para `admin` no documento da coleção `user` pelo Atlas Data Explorer. Não exponha uma rota pública de promoção.

O cliente cria uma reserva autenticada em `POST /api/files`, envia partes de até 4.000.000 bytes para `PUT /api/files/{id}/parts/{n}` e finaliza em `POST /api/files/{id}/complete`. O servidor valida cada corpo e monta o arquivo no R2; as chaves nunca chegam ao navegador. Enquanto partes e arquivo final coexistem, a reserva cobre até o dobro do tamanho solicitado, para o limite continuar valendo durante a montagem. O download usa uma URL assinada curta com disposição de anexo. O bucket deve ser privado, vazio na primeira configuração e exclusivo da aplicação. Dê ao token R2 permissão restrita a esse bucket para listar, ler, gravar e excluir objetos, sem compartilhar nem versionar as credenciais.

Os formatos liberados são JPG, SVG, CDR, PDF e PNG, com no máximo 5.000.000 bytes por arquivo e 15 reservas de envio por usuário a cada dia no horário de Brasília. O Mongo registra os metadados em `customerFiles`. A coleção `r2StorageQuota` inicializa seu contador listando o conteúdo já existente e faz reservas atômicas antes de cada gravação. Assim, dois envios simultâneos não ultrapassam o limite de 9.000.000.000 bytes. Essa garantia depende de o bucket ser exclusivo e de as credenciais de escrita ficarem apenas no servidor.

Ao alcançar 5 GB e 9 GB, os eventos ficam registrados em `storageAlerts` e aparecem em `/admin`. O servidor também envia um e-mail para `juniorholanda@outlook.com` usando a API do Resend. Configure `RESEND_API_KEY` e `STORAGE_ALERT_FROM`; o remetente deve estar verificado no Resend. Crie uma chave Resend com permissão somente para envio e restrita ao domínio remetente. Até configurar essas duas variáveis, os avisos ficam pendentes no MongoDB.

No Google Cloud Console, configure como URI de redirecionamento autorizada `https://SEU-DOMINIO/api/auth/callback/google` (e `http://localhost:3000/api/auth/callback/google` para desenvolvimento), mantendo o `GOOGLE_CLIENT_SECRET` somente no servidor.

Configure `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, as quatro variáveis `CLOUDFLARE_R2_*` e os dados do Resend em `.env.local` e no ambiente de produção. Não coloque segredos em `.env.example` nem os envie pelo chat. Este fluxo de upload é feito pelo servidor e não precisa de CORS de escrita no bucket.

## Desenvolvimento

```bash
npm install
npm run dev
```

O build de produção pode ser executado com `npm run build`.
