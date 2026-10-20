# Orçamentos, gravações e pedidos

O README contém o resumo do produto e das integrações. Esta página detalha o fluxo de orçamento implementado pela API.

## Catálogo e preços

- Catálogo de métodos, slugs, produtos e suporte a pré-orçamento: `packages/domain/engraving-methods.json`.
- Tabela de preço automática inicial: `backend/src/server/quotes/pricing-table.json`.
- Cálculo e serialização: `backend/src/server/quotes/quote-pricing.ts` e `quote-service.ts`.
- O servidor é a fonte do valor oficial; o navegador só solicita a prévia e apresenta o resultado.

A tabela atual cobre Tampografia, com grupos para gravação de até 7 × 60 mm e até 40 × 40 mm conforme o produto. A primeira faixa de cada grupo é preço fechado para o lote; as faixas seguintes são preço por peça. A configuração da tabela mantém os valores concretos e suas faixas.

O cálculo automático considera uma cor por gravação. Outro serviço, produto não listado, dimensão acima do limite ou quantidade de cores diferente de uma leva a análise manual. As faixas de quantidade são consecutivas: depois de uma faixa que termina em `N`, a próxima começa em `N + 1`.

## Fluxo

1. O cliente escolhe serviço, produto, quantidade e uma ou mais gravações. Cada gravação representa um lado/local e contém dimensões, quantidade de cores e um arquivo opcional.
2. `POST /api/v1/quotes/preview` valida o serviço e produto no servidor e calcula a prévia sem gravar um documento.
3. O cliente precisa estar autenticado para enviar um orçamento. Para serviços sem preço automático, a solicitação segue como `requestType: "whatsapp"` e fica disponível para análise da equipe.
4. `POST /api/v1/quotes` valida novamente os campos e calcula o preço no servidor. Para cada gravação com arquivo, confirma que o arquivo completo pertence ao usuário autenticado.
5. A API grava o documento na coleção `quotes` com dados de contato, produto, quantidade, artes, status e uma cópia versionada da tabela/cálculo.
6. Um orçamento pode ser atualizado pelo proprietário enquanto estiver aguardando; a administração pode tratar os status permitidos.
7. `POST /api/v1/orders` aceita apenas um `quoteId` válido com status aprovado. O pedido é gravado em `orders` com cópia dos dados do orçamento e referência de origem.

## Validação de entrada

- Quantidade: de 1 a 100.000 peças.
- Artes/gravações: de 1 a 100 por orçamento.
- Cada gravação informa local/lado, largura e altura em milímetros e de 1 a 16 cores.
- Um item de gravação aceita no máximo um `fileId`. A API verifica proprietário e estado do arquivo no MongoDB antes de associá-lo.
- Contatos incluem nome, empresa, telefone, celular, CNPJ, título e mensagem; nome, título, mensagem e um telefone ou celular são necessários.

## Modelo gravado

Um documento `quotes` guarda, em termos gerais:

- `ownerUserId`, número e datas do orçamento;
- slug e nome do serviço, tipo de solicitação, produto e quantidade;
- cópia dos dados de contato;
- `engravings[]` com local, dimensões, cores e `customerFileId` opcional;
- `pricing` com estado do cálculo, moeda, identificação/versão da tabela, total em centavos e linhas calculadas;
- status do orçamento.

Um pedido preserva a identificação do orçamento de origem, o usuário proprietário e a cópia do serviço, cliente, produto, quantidade, gravações e preço aprovado. Assim, alterações posteriores na tabela de preços não mudam o histórico já enviado.
