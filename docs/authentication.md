# Autenticação

O navegador chama `/api/auth/*` e `/api/v1/*` no domínio do frontend. Os rewrites em `next.config.ts` encaminham essas chamadas ao Render, que executa a autenticação e acessa MongoDB/R2. Os cookies ficam no domínio do site (`HttpOnly`, `SameSite=Lax`, e `Secure` em produção).

## Configuração

| Local | Variável | Valor |
| --- | --- | --- |
| Frontend | `NEXT_PUBLIC_API_URL` | Origem do backend: `http://localhost:4000` localmente; URL do Render em produção. |
| Backend | `BETTER_AUTH_URL` | Origem do frontend: `http://localhost:3000` localmente; URL pública do site em produção. |
| Backend | `FRONTEND_ORIGINS` | Origens exatas autorizadas, separadas por vírgula. |
| Backend | `BETTER_AUTH_SECRET` | Segredo aleatório de sessão; guardar somente no backend. |
| Backend | `RESEND_API_KEY` e `STORAGE_ALERT_FROM` | Chave de envio e remetente de domínio verificado no Resend. |
| Backend | `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` | Opcionais; habilitam Google OAuth quando ambas estão presentes. |

O callback Google é `https://<dominio-do-frontend>/api/auth/callback/google`. A Vercel e o Render devem publicar a mesma branch (`rota`). Após alterações de variáveis, faça um novo deploy.

Sem remetente configurado, novos cadastros e reenvios de confirmação retornam HTTP 503 antes de criar uma conta. Contas confirmadas continuam podendo entrar. `/api/auth/config` informa os métodos configurados sem expor segredos; não comprova a entrega de e-mails pelo provedor.

O cadastro envia o link de confirmação com retorno para a página de origem. O login exige confirmação, e a interface permite reenviar o link quando o envio está configurado. O orçamento pendente continua preservado pelo fluxo existente. Senhas incorretas, limites de tentativas e falhas de conexão têm mensagens em português.

## Desenvolvimento e validação

`npm run dev` inicia frontend e backend juntos. Para separar os processos, use `npm run dev:frontend` e `npm run api:dev`.

`npm run test:auth` usa a URI de `backend/.env.local`, cria um banco temporário com nome aleatório e remove esse banco ao final. Testa cadastro, hash da senha, bloqueio de conta não confirmada, reenvio, confirmação, retorno à página, sessão, senha incorreta, origem não autorizada e logout. O transporte de e-mail é simulado em memória, sem enviar mensagens. O teste não altera usuários do banco da aplicação e não substitui a validação de entrega real do e-mail ou do navegador em produção.
