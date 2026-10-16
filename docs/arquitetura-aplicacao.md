# Arquitetura da aplicação

O projeto segue uma arquitetura de **monólito modular com Next.js**: frontend e backend ficam no mesmo repositório e deploy, mas cada parte tem uma fronteira explícita. O Next.js continua responsável pelo roteamento e execução na Vercel.

## Mapa de responsabilidades

- `src/app`: páginas Next.js, ações de servidor e adaptadores das rotas HTTP. Os arquivos em `src/app/api/**/route.ts` só encaminham os métodos para os handlers do backend.
- `src/components` e `src/styles`: interface e estilos. Componentes de navegador não importam módulos de `src/server`.
- `src/server/http`: handlers HTTP do backend; interpretam requisições, verificam sessão/origem, traduzem erros para status HTTP e coordenam os módulos de negócio.
- `src/server/<módulo>`: regras e serviços separados por área, como `quotes`, `customers`, `files` e `admin`.
- `src/server/database`: conexão MongoDB, definições de documentos e criação dos acessos às coleções.
- `src/lib`: utilitários seguros para compartilhar com o navegador, como preferências de tema, tipos de conta, upload iniciado pelo cliente e links de WhatsApp. Código que acessa segredos ou serviços privados não fica aqui.
- `src/data/engraving-methods.json`: catálogo público de serviços usado pelo site. A tabela de preços fica em `src/server/quotes` e só é lida no servidor.

## Direção dos imports

1. A interface chama uma rota HTTP ou uma ação de servidor; não acessa MongoDB, R2 ou variáveis secretas diretamente.
2. Uma rota em `src/app/api` encaminha a chamada para `src/server/http`.
3. O handler usa o módulo da área correspondente. Serviços reutilizáveis ficam em `src/server/<módulo>`, e coleções são obtidas por `src/server/database/mongodb.ts`.
4. Módulos privados importam `server-only` para impedir seu uso em componentes de navegador.
5. `src/lib` não importa `src/server`. Se um utilitário precisar de credenciais ou APIs privadas, ele pertence a `src/server`.

## Adicionando uma funcionalidade

Crie ou estenda um módulo em `src/server` para a regra de negócio e persistência. Se houver uma nova URL, adicione um handler em `src/server/http` e deixe o `route.ts` do Next como encaminhador. A interface fica em `src/components` ou junto à página correspondente. Atualize este documento quando uma nova área ou integração alterar essas fronteiras.

As regras de preço ainda são um arquivo de configuração versionado no projeto. Se a dashboard precisar editar preços, a próxima etapa será persistir as tabelas em uma coleção do MongoDB e permitir alterações somente por sessões administrativas.
