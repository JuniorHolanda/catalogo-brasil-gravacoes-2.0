# Serviços, pedidos e orçamentos

## Catálogo e páginas

`src/data/engraving-methods.json` é o catálogo compartilhado pelo site e pela API. Cada serviço contém seu `slug`, nome, produtos, descrição e a configuração `supportsPreQuote`. A rota `/servicos/[slug]` gera uma página por serviço e carrega o formulário correspondente.

O navegador envia o `slug` e o nome exibido para `POST /api/quotes`. No servidor, o serviço é novamente resolvido pelo catálogo; nome, elegibilidade e produto são validados antes de gravar qualquer pedido. O valor enviado pelo navegador nunca é tratado como preço oficial.

## Envio de pedido

1. A pessoa escolhe produto e quantidade e adiciona uma ou mais gravações. Cada gravação tem lado/local, dimensões, quantidade de cores e um arquivo opcional.
2. Cada arquivo passa pela API autenticada, respeitando o limite de 5 MB, é associado à conta e fica no bucket privado R2.
3. A prévia é consultada em `POST /api/quotes/preview` e calculada no servidor. Essa rota não grava pedido nem aceita um preço calculado pelo navegador como oficial.
4. O formulário pode guardar um rascunho em `sessionStorage` no navegador. Sem sessão, ao gerar o pedido, o site abre o cadastro/entrada. O pedido continua após o cadastro por e-mail; se o acesso Google recarregar a página, os campos ficam temporariamente na sessão do navegador.
5. `POST /api/quotes` valida os campos de contato e orçamento e grava o pedido na coleção `customerQuotes`, associado ao ID da sessão. O documento inclui um retrato dos dados de contato, um array `engravings` com dimensões, cores, lado/local e referência do arquivo, além da cópia do cálculo e versão da tabela usadas naquele pedido.
6. `GET /api/quotes` devolve apenas os três pedidos mais recentes da conta, usados no menu do usuário.

A gravação exige sessão autenticada. O servidor ignora IDs de usuário vindos do formulário e verifica se o arquivo anexado pertence à mesma conta. A API só permite anexar arquivos completos e existentes na coleção `customerFiles`.

## Coleções usadas

- `user`, `session` e outras coleções do Better Auth: contas e sessões.
- `customerQuotes`: referência, usuário, serviço, retrato dos dados de contato, produto, quantidade, array `engravings`, status e datas. O MongoDB guarda esses objetos como documentos BSON, sem serializar o array como uma string JSON.
- `customerFiles`: metadados dos arquivos privados guardados no R2.
- `customers`: cadastros enviados pelo formulário de contato.

As coleções e seus índices são preparados pelo código do Next.js na primeira utilização. O navegador não conecta diretamente ao Atlas.

Um pedido com duas artes fica estruturado assim na coleção `customerQuotes`:

```json
{
  "customer": {
    "name": "Nome do cliente",
    "company": "Empresa",
    "phone": "1133334444",
    "mobile": "11999998888",
    "cnpj": "12345678000199",
    "title": "Gravação em suporte",
    "message": "Detalhes do pedido"
  },
  "product": "Suporte retrátil para celular",
  "quantity": 100,
  "engravings": [
    {
      "location": "Frente",
      "logoWidthMm": 20,
      "logoHeightMm": 10,
      "colorCount": 1,
      "customerFileId": "..."
    },
    {
      "location": "Verso",
      "logoWidthMm": 30,
      "logoHeightMm": 15,
      "colorCount": 1,
      "customerFileId": "..."
    }
  ],
  "pricing": {
    "status": "calculated",
    "currency": "BRL",
    "tableId": "tampografia-v2",
    "tableVersion": 2,
    "totalCents": 33000,
    "lines": [
      {
        "engravingNumber": 1,
        "location": "Frente",
        "pricingGroupId": "tampografia-logo-40x40mm",
        "tierMinQuantity": 1,
        "tierMaxQuantity": 100,
        "kind": "fixedBatch",
        "quantity": 100,
        "amountCents": 16500,
        "lineTotalCents": 16500
      },
      {
        "engravingNumber": 2,
        "location": "Verso",
        "pricingGroupId": "tampografia-logo-40x40mm",
        "tierMinQuantity": 1,
        "tierMaxQuantity": 100,
        "kind": "fixedBatch",
        "quantity": 100,
        "amountCents": 16500,
        "lineTotalCents": 16500
      }
    ]
  },
  "status": "awaiting"
}
```

Os arquivos continuam no R2; o documento guarda as referências. A ordem dos objetos em `engravings` preserva a sequência das gravações no formulário.

## Regras de orçamento

`src/server/quotes/pricing-table.json` contém a primeira tabela automática: Tampografia, com o grupo de logo de 7 × 60 mm e o grupo de 40 × 40 mm. No primeiro grupo, os produtos precisam respeitar largura máxima de 7 mm e altura máxima de 60 mm; no segundo, largura e altura ficam limitadas a 40 mm. A primeira faixa de cada grupo é tratada como valor fechado do lote; as demais são valores por peça. Cada gravação é calculada separadamente e somada ao pedido.

As faixas são contínuas: quando uma faixa termina em `N`, a próxima começa em `N + 1` (por exemplo, 1.000 → 1.001). A tabela atual cobre uma cor por gravação. Produtos sem regra, dimensões acima do máximo ou mais de uma cor geram um pedido para análise manual, sem total automático.

Para uma nova técnica, adicione os dados ao catálogo e configure seus produtos e a elegibilidade de pré-orçamento. As páginas serão geradas a partir do mesmo catálogo e a API usará a mesma lista para validar o pedido.
