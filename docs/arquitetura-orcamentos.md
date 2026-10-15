# Arquitetura de serviços, usuários e orçamentos

## O que existe no projeto

- O Next.js renderiza o site e as páginas de serviço.
- `src/data/engraving-methods.json` contém dados públicos dos serviços, incluindo `slug` e `supportsPreQuote`.
- `src/components/engraving-method-card.tsx` mostra um serviço; o link usa o `slug` para abrir `/servicos/[slug]`.
- A API e o banco ainda não estão neste repositório. A direção definida é hospedar a API no Render e usar MongoDB.

O JSON público serve para montar a interface. Ele não deve guardar dados de clientes, preços privados, senhas ou tokens. A API precisa manter sua própria regra de quais serviços aceitam pré-orçamento; não pode confiar no valor enviado pelo navegador.

## Fluxo pretendido

1. A pessoa escolhe um serviço e a página consulta o catálogo pelo `slug`.
2. Se o serviço não aceita pré-orçamento, a página oferece contato manual pelo WhatsApp.
3. Se aceita, a página coleta os dados necessários e pede uma simulação à API.
4. A API valida os campos e calcula o valor com regras que ficam no servidor.
5. Uma pessoa sem sessão pode ver a simulação. Para salvar, fazer pedido ou acompanhar o orçamento, ela cria uma conta ou entra.
6. Depois da autenticação, a API valida novamente os dados, recalcula o valor e grava o orçamento ligado ao usuário autenticado.

O valor calculado no navegador nunca deve ser aceito como valor oficial. Na gravação, a API calcula de novo e usa o identificador da sessão autenticada para preencher `userId`; ela ignora qualquer `userId` enviado no formulário.

## Contrato inicial sugerido para a API

- `POST /auth/register`: valida os dados e cria uma conta com senha armazenada como hash.
- `POST /auth/login`: autentica e cria uma sessão segura.
- `POST /auth/logout`: encerra a sessão.
- `GET /auth/me`: retorna somente os dados públicos da conta autenticada.
- `POST /quotes/preview`: valida os dados e retorna uma simulação sem salvar um orçamento.
- `POST /quotes`: exige autenticação, valida e recalcula os dados e salva o orçamento.
- `GET /me/quotes`: lista somente os orçamentos da pessoa autenticada.

Os nomes e campos finais dependem dos formulários e das regras de preço de cada técnica. O preview pode ser refeito após o cadastro para não confiar em um valor calculado antes do login.

## Dados e segurança

- A URI do MongoDB e os segredos de sessão ficam nas variáveis privadas do serviço da API no Render. Nunca use prefixo `NEXT_PUBLIC_` nesses segredos.
- O cliente recebe apenas a URL pública da API, que não é segredo.
- A API valida tipo, tamanho e limites de cada entrada, autentica operações de gravação e verifica a propriedade de cada orçamento antes de devolver ou alterar dados.
- Armazene valores monetários em centavos inteiros ou em um tipo decimal adequado, nunca em ponto flutuante binário.
- Senhas são armazenadas somente com hash forte; sessões devem usar cookies `HttpOnly` e `Secure`, com CORS limitado ao domínio do site e proteção CSRF conforme a configuração dos domínios.
- O banco deve ter índice único para e-mail normalizado e índice por `userId` e data para consultas de orçamento.

## O que falta para ativar o fluxo

SilkScreen está marcado com `supportsPreQuote: true`; as outras técnicas estão como `false`. Ainda faltam os campos do formulário, as regras de cálculo de SilkScreen, o formato definitivo da API e a implementação do servidor no Render. Até isso existir, a marcação no JSON é configuração do catálogo, não uma promessa de cálculo já ativo.
