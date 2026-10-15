# Serviços, pedidos e orçamentos

## Catálogo e páginas

`src/data/engraving-methods.json` é o catálogo compartilhado pelo site e pela API. Cada serviço contém seu `slug`, nome, produtos, descrição e a configuração `supportsPreQuote`. A rota `/servicos/[slug]` gera uma página por serviço e carrega o formulário correspondente.

O navegador envia o `slug` e o nome exibido para `POST /api/quotes`. No servidor, o serviço é novamente resolvido pelo catálogo; nome, elegibilidade e produto são validados antes de gravar qualquer pedido. O valor enviado pelo navegador nunca é tratado como preço oficial.

## Envio de pedido

1. A pessoa escolhe produto, quantidade, dimensões do logo, cores e, se quiser, anexa uma arte.
2. A arte passa pela API autenticada de arquivos, é associada à conta e fica no bucket privado R2.
3. Sem sessão, o site abre o cadastro/entrada. O pedido continua após o cadastro por e-mail; se o acesso Google recarregar a página, os campos do pedido ficam temporariamente na sessão do navegador.
4. `POST /api/quotes` valida os campos e grava o pedido na coleção `customerQuotes`, associado ao ID da sessão. Para técnicas sem pré-orçamento, o botão de cálculo fica desativado; a solicitação é registrada pela API antes de liberar o link para continuar no WhatsApp.
5. `GET /api/quotes` devolve apenas os três pedidos mais recentes da conta, usados no menu do usuário.

A gravação exige sessão autenticada. O servidor ignora IDs de usuário vindos do formulário e verifica se o arquivo anexado pertence à mesma conta. A API só permite anexar arquivos completos e existentes na coleção `customerFiles`.

## Coleções usadas

- `user`, `session` e outras coleções do Better Auth: contas e sessões.
- `customerQuotes`: referência, usuário, serviço, configuração do pedido, arquivo opcional, status e datas.
- `customerFiles`: metadados dos arquivos privados guardados no R2.
- `customers`: cadastros enviados pelo formulário de contato.

As coleções e seus índices são preparados pelo código do Next.js na primeira utilização. O navegador não conecta diretamente ao Atlas.

## Regras de orçamento

`supportsPreQuote` controla a disponibilidade visual do botão de cálculo. A API ainda precisa receber as regras e a tabela de preços para calcular e retornar um valor real. Até essas regras serem configuradas, os pedidos são registrados com status `awaiting`; não é exibido um total inventado.

Para uma nova técnica, adicione os dados ao catálogo e configure seus produtos e a elegibilidade de pré-orçamento. As páginas serão geradas a partir do mesmo catálogo e a API usará a mesma lista para validar o pedido.
