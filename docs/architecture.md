# Arquitetura da aplicação

O repositório usa npm workspaces. A aplicação em `src/` é o frontend Next.js, implantado na Vercel. A API é outra aplicação Next.js em `backend/`, preparada para Render. O catálogo público de serviços fica em `packages/domain/` para que as duas aplicações usem os mesmos nomes e slugs.

## Banco de dados

MongoDB Atlas usa coleções, em vez de tabelas SQL. As coleções de negócio são:

- `users`: usuários e campos de autenticação gerenciados por Better Auth. No primeiro acesso da API, os documentos antigos da coleção `user` são copiados para `users` sem apagar a coleção de origem.
- `quotes`: solicitações e pré-orçamentos; as gravações e os dados de contato ficam incorporados no documento do orçamento.
- `orders`: pedidos aceitos, com uma cópia dos dados do orçamento para preservar o histórico.

Outras coleções armazenam solicitações de contato, arquivos enviados, controle de cota de armazenamento e sessões de autenticação. Elas são suporte do sistema e não substituem as três coleções de negócio acima.

Um orçamento só vira pedido quando estiver com status `approved` e o cliente aceitar. O endpoint de criação do pedido recebe `{ "quoteId": "..." }` e rejeita orçamento ainda pendente ou recusado.

## Rotas REST

Todas as rotas da API de negócio usam `/api/v1`. A autenticação permanece em `/api/auth`.

| Recurso | Rotas | Acesso |
| --- | --- | --- |
| Usuários | `GET/PATCH /api/v1/users/me`, CRUD em `/api/v1/users` e `/api/v1/users/:id` | perfil próprio; operações administrativas para a lista e outros usuários |
| Orçamentos | `GET/POST /api/v1/quotes`, `GET/PATCH/DELETE /api/v1/quotes/:id` | usuário dono; administração pode acessar todos |
| Pedidos | `GET/POST /api/v1/orders`, `GET/PATCH/DELETE /api/v1/orders/:id` | usuário dono; administração pode acessar todos |
| Arquivos | `/api/v1/files/...` | usuário autenticado, com propriedade checada no servidor |
| Serviços | `GET /api/v1/services` e `/api/v1/services/:slug` | público |
| Saúde | `GET /api/health` | público |

As operações de administrador exigem sessão Better Auth com papel `admin`. O e-mail definido em `ADMIN_EMAILS` só é promovido depois de verificado. O cadastro por e-mail envia confirmação pelo Resend; Google também retorna e-mail verificado pelo provedor. O padrão local usa `juniorholanda@outlook.com`.

## Desenvolvimento local

Copie as variáveis de `backend/.env.example` para `backend/.env.local` e as de `.env.example` para `.env.local` na raiz. Execute os processos em terminais separados:

```sh
npm run dev
npm run api:dev
```

O frontend inicia na porta 3000 e a API na 4000. Não coloque segredos do MongoDB, Better Auth ou R2 no `.env.local` do frontend.

## Render e Vercel

O blueprint `render.yaml` configura o serviço API. Mantenha o diretório raiz do serviço Render como a raiz do repositório, pois o lockfile e o pacote compartilhado ficam nela. O build instala os workspaces e compila apenas `backend/`.

Configure em Render as variáveis secretas de `backend/.env.example`. Use `BETTER_AUTH_URL` com a URL pública completa da API e `FRONTEND_ORIGINS` com a origem exata da Vercel, sem barra final. Na Vercel, configure `NEXT_PUBLIC_API_URL` com a URL da API. No Google OAuth, cadastre o callback `https://<api>/api/auth/callback/google` como URI de redirecionamento autorizada.

Para a sessão com cookies funcionar de forma estável entre sites, configure um domínio próprio para a API, como `api.seudominio.com`, e use o mesmo domínio raiz no frontend. A API exige origem CORS explícita e usa cookies `HttpOnly`, `Secure` e `SameSite=None` em produção.
