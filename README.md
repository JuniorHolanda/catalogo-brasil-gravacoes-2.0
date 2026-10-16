# Brasil Gravações

O projeto é um workspace npm com duas aplicações Next.js independentes:

- `src/`: frontend, publicado na Vercel.
- `backend/`: API REST, preparada para Render.
- `packages/domain/`: catálogo de serviços compartilhado pelas duas aplicações.

## Rodar localmente

Copie `.env.example` para `.env.local` na raiz e `backend/.env.example` para `backend/.env.local`. As credenciais do MongoDB Atlas, Better Auth, Google OAuth, Resend e R2 ficam somente no arquivo do backend.

Em terminais separados:

```sh
npm install
npm run dev
npm run api:dev
```

O frontend abre em `http://localhost:3000` e a API em `http://localhost:4000`. Configure o `BETTER_AUTH_SECRET` e as credenciais de e-mail no arquivo local do backend antes de usar cadastro e login por e-mail.

## Publicação

`render.yaml` configura a API. Mantenha o diretório raiz do serviço Render como a raiz deste repositório. A aplicação web usa os comandos padrão `npm run build` e `npm start` na Vercel.

Na Vercel, defina `NEXT_PUBLIC_API_URL` para a URL pública da API. No Render, configure as variáveis de `backend/.env.example`, incluindo `BETTER_AUTH_URL` e `FRONTEND_ORIGINS`. Consulte [docs/architecture.md](docs/architecture.md) para as rotas REST, coleções MongoDB, autorização e detalhes de publicação.
