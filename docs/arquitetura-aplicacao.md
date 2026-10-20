# Fronteiras das aplicações

Este repositório é um workspace npm com três aplicações Next.js independentes: frontend, API e dashboard administrativa. Para as instruções gerais, consulte o [README principal](../README.md).

## Mapa de responsabilidades

- `src/app`: páginas do frontend — início, página dinâmica de serviço, painel do cliente e tela administrativa.
- `src/components` e `src/styles`: interface, componentes, temas e estilos. Não acessam Atlas/R2 nem importam código privado da API.
- `src/lib`: cliente HTTP, sessão do navegador e utilitários seguros para o frontend.
- `dashboard/src/app`: login e painel administrativo, publicados separadamente e sem indexação por mecanismos de busca.
- `dashboard/src/styles`: apresentação da dashboard, alinhada ao tema compartilhado do site.
- `backend/src/app/api`: Route Handlers que expõem endpoints REST.
- `backend/src/server/http`: validação de sessão/origem, leitura de payload e conversão de erros para respostas HTTP.
- `backend/src/server/auth`: Better Auth, sessão, autorização e papel administrativo.
- `backend/src/server/database`: conexão MongoDB, tipos de documentos, validadores e índices das coleções.
- `backend/src/server/quotes`, `orders`, `customers`, `files` e `admin`: regras de negócio por área.
- `packages/domain`: dados de domínio sem dependência do navegador ou de serviços privados; atualmente contém o catálogo compartilhado de serviços.

## Direção das chamadas

1. O site e a dashboard chamam `/api/*` no próprio domínio. O frontend usa `NEXT_PUBLIC_API_URL`; a dashboard usa `API_HOSTPORT` no Render ou `http://localhost:4000` em desenvolvimento. Os rewrites preservam os cookies no domínio de cada app.
2. Um endpoint Next.js em `backend/src/app/api` encaminha a requisição para um handler da área correspondente.
3. O handler verifica a sessão, a origem quando a operação altera estado, e a propriedade do recurso.
4. O serviço de negócio valida novamente os dados recebidos e acessa as coleções MongoDB ou o R2.
5. A API retorna JSON ao frontend. Segredos e credenciais nunca atravessam essa fronteira.

O frontend e o backend não compartilham módulos de implementação. O pacote `@brasil-gravacoes/domain` é a única dependência de domínio compartilhada.

## Adicionar um endpoint

- Coloque a rota HTTP em `backend/src/app/api/v1`.
- Delegue validação e regras de negócio a um módulo em `backend/src/server`.
- Faça as verificações de sessão, papel, origem e propriedade no backend; nunca confie em IDs ou preços informados pelo navegador.
- Atualize o inventário de endpoints no README.
