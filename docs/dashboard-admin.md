# Dashboard administrativa

A dashboard usa uma aplicação Next.js em `dashboard/`, com suas telas integradas ao frontend publicado na Vercel. Em produção, o login fica em `/admin` e o painel em `/dashboard`, no mesmo domínio do site. A API e os dados continuam no Render. Em desenvolvimento, `npm run dev` inicia o site em `http://localhost:3000`, a API em `http://localhost:4000` e a aplicação isolada da dashboard em `http://localhost:3100`.

## Login e perfis

A dashboard aceita login por e-mail e senha com Better Auth. A API concede papel administrativo somente aos endereços listados em `ADMIN_EMAILS` quando a conta está verificada; os endpoints continuam verificando a permissão no servidor. O app não oferece cadastro público de administradores e não habilita uma segunda etapa de autenticação.

Para provisionar os perfis `contato@brasilgravacoes.com.br` e `vendas@brasilgravacoes.com.br`:

1. Configure `ADMIN_EMAILS` com esses endereços no backend e inclua a origem do frontend em `FRONTEND_ORIGINS`.
2. Defina temporariamente `ADMIN_BOOTSTRAP_PASSWORD` no ambiente local do backend.
3. Na raiz do repositório, execute `npm run admins:bootstrap --workspace @brasil-gravacoes/backend`.
4. Remova `ADMIN_BOOTSTRAP_PASSWORD` do ambiente após o comando terminar.

O comando cria ou atualiza os dois perfis usando o hash de senha do Better Auth, marca os e-mails como verificados e encerra sessões anteriores. Ele não roda automaticamente durante o deploy. A senha nunca fica no código nem no `render.yaml`.

## Render e Vercel

O `render.yaml` ainda declara um serviço independente da dashboard para desenvolvimento e compatibilidade. A versão de produção é servida pelo frontend Vercel, no mesmo domínio da aplicação. A API continua no Render; como ela usa o plano gratuito, o acesso da dashboard isolada usa a URL HTTPS pública definida em `API_URL`. Depois da primeira sincronização:

- No serviço da API, mantenha `BETTER_AUTH_URL` apontando para o site público e inclua as origens exatas do site e da dashboard em `FRONTEND_ORIGINS`, separadas por vírgula.
- Para a dashboard integrada na Vercel, mantenha `NEXT_PUBLIC_API_URL` apontando para a origem HTTPS pública da API.
- No serviço isolado da dashboard no Render, confirme se `API_URL` aponta para a origem HTTPS pública da API.
- No serviço da API do Render, configure os quatro valores `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY` e `CLOUDFLARE_R2_BUCKET`. O binário do arquivo só fica pronto depois que as partes e o objeto final forem confirmados no R2.
- Confira se `MONGODB_URI` começa exatamente com `mongodb+srv://` ou `mongodb://`; não inclua aspas externas. Uma URI malformada impede o health check e o deploy da API.

Nunca registre chaves do R2, URI do Atlas ou senha de provisionamento em documentos versionados. Em `backend/.env.local`, cole os valores sem aspas extras; esse arquivo fica fora do Git.

## Privacidade e conteúdo

As páginas da dashboard incluem metadados `noindex` e enviam `X-Robots-Tag: noindex, nofollow, noarchive`. Os dados continuam protegidos pelos endpoints autenticados da API; `noindex` apenas orienta mecanismos de busca e não substitui a autorização.

O dashboard mostra os orçamentos mais recentes, associa cada registro à conta de origem, acompanha os totais e apresenta alertas de armazenamento. A área do cliente mostra os próprios orçamentos ao lado dos arquivos da conta. Os metadados do orçamento e a referência ao cliente ficam no MongoDB; o conteúdo binário enviado fica no R2.
