# Dashboard administrativa

A dashboard roda como uma aplicação Next.js própria em `dashboard/`, separada do site público e da API. Em desenvolvimento, `npm run dev` inicia o site em `http://localhost:3000`, a API em `http://localhost:4000` e a dashboard em `http://localhost:3100`. O caminho `/admin` do site encaminha para a origem configurada em `NEXT_PUBLIC_DASHBOARD_URL`.

## Login e perfis

A dashboard aceita login por e-mail e senha com Better Auth. A API concede papel administrativo somente aos endereços listados em `ADMIN_EMAILS` quando a conta está verificada; os endpoints continuam verificando a permissão no servidor. O app não oferece cadastro público de administradores e não habilita uma segunda etapa de autenticação.

Para provisionar os perfis `contato@brasilgravacoes.com.br` e `vendas@brasilgravacoes.com.br`:

1. Configure `ADMIN_EMAILS` com esses endereços no backend e inclua a origem da dashboard em `FRONTEND_ORIGINS`.
2. Defina temporariamente `ADMIN_BOOTSTRAP_PASSWORD` no ambiente local do backend.
3. Na raiz do repositório, execute `npm run admins:bootstrap --workspace @brasil-gravacoes/backend`.
4. Remova `ADMIN_BOOTSTRAP_PASSWORD` do ambiente após o comando terminar.

O comando cria ou atualiza os dois perfis usando o hash de senha do Better Auth, marca os e-mails como verificados e encerra sessões anteriores. Ele não roda automaticamente durante o deploy. A senha nunca fica no código nem no `render.yaml`.

## Render e Vercel

O `render.yaml` declara um segundo serviço, `brasil-gravacoes-dashboard`, no mesmo repositório e região da API. O Render injeta `API_HOSTPORT` apontando para o serviço privado da API. Depois da primeira sincronização:

- No serviço da API, mantenha `BETTER_AUTH_URL` apontando para o site público e inclua as origens exatas do site e da dashboard em `FRONTEND_ORIGINS`, separadas por vírgula.
- No serviço da dashboard, confirme se `API_HOSTPORT` foi preenchido pelo Blueprint.
- Na Vercel, configure `NEXT_PUBLIC_DASHBOARD_URL` com a URL HTTPS pública do serviço da dashboard.
- No serviço da API do Render, configure os quatro valores `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY` e `CLOUDFLARE_R2_BUCKET`. O binário do arquivo só fica pronto depois que as partes e o objeto final forem confirmados no R2.
- Confira se `MONGODB_URI` começa exatamente com `mongodb+srv://` ou `mongodb://`; não inclua aspas externas. Uma URI malformada impede o health check e o deploy da API.

Nunca registre chaves do R2, URI do Atlas ou senha de provisionamento em documentos versionados. Em `backend/.env.local`, cole os valores sem aspas extras; esse arquivo fica fora do Git.

## Privacidade e conteúdo

As páginas da dashboard incluem metadados `noindex` e enviam `X-Robots-Tag: noindex, nofollow, noarchive`. Os dados continuam protegidos pelos endpoints autenticados da API; `noindex` apenas orienta mecanismos de busca e não substitui a autorização.

O dashboard mostra os orçamentos mais recentes, associa cada registro à conta de origem, acompanha os totais e apresenta alertas de armazenamento. A área do cliente mostra os próprios orçamentos ao lado dos arquivos da conta. Os metadados do orçamento e a referência ao cliente ficam no MongoDB; o conteúdo binário enviado fica no R2.
