# Arquitetura e operação

O guia completo de tecnologias, configuração local, variáveis e deploy fica no [README principal](../README.md). Esta página registra detalhes da arquitetura de produção.

## Aplicações e fronteiras

- **Frontend:** aplicação Next.js independente em `src/`, publicada na Vercel.
- **API REST:** aplicação Next.js independente em `backend/`, publicada no Render. Os handlers ficam em `backend/src/app/api` e as regras privadas em `backend/src/server`.
- **Dashboard administrativa:** aplicação Next.js independente em `dashboard/`, publicada como um serviço separado no Render.
- **Domínio compartilhado:** catálogo de métodos e produtos em `packages/domain/engraving-methods.json`.
- **Dados:** MongoDB Atlas, no banco `brasil-gravacoes`.
- **Arquivos:** Cloudflare R2; o MongoDB armazena os metadados e referências dos objetos.
- **E-mail:** Resend para confirmação de cadastro e alertas de armazenamento.

A UI não importa serviços privados do backend nem se conecta diretamente a Atlas/R2. Ela chama endpoints HTTPS, e a API autentica as requisições e aplica as regras de negócio.

O site e a dashboard usam origens separadas, ambas incluídas em `FRONTEND_ORIGINS`. A dashboard encaminha as chamadas autenticadas à API pelo endereço privado do Render.

## Persistência

As principais coleções MongoDB são `users`, `customers`, `quotes` e `orders`. Coleções auxiliares mantêm metadados de arquivos, contadores de uploads diários, quota global do R2 e estado dos alertas.

As coleções e índices são inicializados pela API no primeiro uso. Compatibilidade com dados legados copia documentos de `user` para `users` e de `customerQuotes` para `quotes`, preservando as coleções originais.

## Deploy

O Blueprint em [render.yaml](../render.yaml) mantém os serviços da API e da dashboard na raiz do repositório porque o lockfile e os npm workspaces são compartilhados. A API executa `npm ci && npm run api:build`, inicia com `npm run api:start` e verifica `/api/health`. A dashboard usa `npm run dashboard:build` e `npm run dashboard:start`.

A Vercel publica o frontend pela raiz, usando `npm run build`; a dashboard administrativa fica no mesmo domínio em `/admin` e `/dashboard`. A variável `NEXT_PUBLIC_API_URL` aponta para a URL-base pública da API e configura o destino dos rewrites de `/api/*`. No Render, `FRONTEND_ORIGINS` contém as origens exatas autorizadas e `BETTER_AUTH_URL` aponta para a origem pública do frontend, incluindo em desenvolvimento (`http://localhost:3000`).

## Sessões entre domínios

Em produção, a API usa cookies `HttpOnly`, `Secure` e `SameSite=Lax` e valida origens configuradas. Cada app encaminha `/api/auth/*` pelo próprio domínio, sem depender de cookies de terceiros. Confirmações por e-mail e o callback OAuth (`/api/auth/callback/google`) usam a URL pública do frontend. MongoDB, R2 e as regras de negócio continuam exclusivamente na API do Render.

Consulte [docs/dashboard-admin.md](dashboard-admin.md) para o fluxo de login, provisionamento dos perfis administrativos e configuração do deploy.

## Limite do R2

A API registra o uso inicial do bucket, reserva espaço durante uploads e bloqueia novas operações pela API no limite lógico de 9 GB. O limite depende de todo acesso de gravação passar pelo backend; mantenha o bucket exclusivo do projeto e não permita gravações externas que contornem a quota.
