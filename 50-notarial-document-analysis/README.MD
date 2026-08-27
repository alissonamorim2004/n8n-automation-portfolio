# Análise de Documentos Cartoriais com OCR e IA

Sistema completo de análise documental para cooperativa de crédito: uma
plataforma web onde o analista faz upload de matrículas, escrituras e certidões,
e um pipeline de OCR e IA que extrai o conteúdo, aplica o template de análise da
instituição e devolve o parecer estruturado — com custo por análise contabilizado
por usuário.

- **Setor:** Serviços financeiros / Cooperativa de crédito
- **Status:** Em produção
- **Composição:** plataforma web (React + NestJS, ~4.700 linhas) + pipeline n8n (43 nós)

---

## O problema

Cooperativa de crédito que trabalha com garantia imobiliária depende de leitura de
documento cartorial: matrícula de imóvel, escritura, certidão de ônus. O analista
precisa extrair proprietário, descrição do imóvel, ônus, gravames, alienações,
área e confrontações — e conferir se há alguma coisa que impeça a operação.

Três características tornam isso caro:

**O documento é hostil à leitura automática.** Matrícula é PDF digitalizado, com
carimbo, averbação manuscrita, texto em coluna estreita e layout que varia por
cartório. OCR genérico devolve texto embaralhado.

**A leitura é longa e repetitiva.** Uma matrícula com muitas averbações passa de
vinte páginas, e o analista lê tudo procurando meia dúzia de informações.

**A análise depende de um roteiro que muda.** O que a cooperativa quer extrair de
uma escritura não é o mesmo de uma certidão, e o roteiro muda conforme a política
de crédito. Prender isso no código significa chamar o desenvolvedor a cada
ajuste.

E havia um requisito específico de instituição financeira: **saber quanto cada
análise custou e quem consumiu**. IA por token, sem contabilidade, é despesa que
ninguém consegue justificar internamente.

---

## A solução

Dois componentes que trabalham juntos.

### Plataforma web

Aplicação onde a operação vive:

- **Usuários e papéis** — autenticação JWT, guarda de rotas por papel
- **Tipos de análise** — cada tipo é um template editável que define o que
  extrair de cada espécie de documento
- **Upload** — arquivo único ou lote
- **Resultados** — parecer estruturado devolvido à tela
- **Consumo de tokens** — página dedicada de custo por usuário e por análise

### Pipeline n8n

O motor que faz o trabalho:

1. Recebe o documento da plataforma
2. Envia ao serviço de OCR de documentos, que preserva layout, tabelas e
   estrutura
3. Faz *polling* até o processamento assíncrono terminar
4. Monta o prompt com o template escolhido e o texto extraído
5. Envia ao modelo, com a faixa de capacidade selecionada
6. Calcula o custo a partir dos tokens consumidos
7. Grava no banco e devolve à plataforma

---

## Arquitetura

```
   ┌──────────────────────────────────────────────┐
   │              PLATAFORMA WEB                  │
   │                                              │
   │  React + TypeScript + Vite + Tailwind        │
   │  ┌────────┬──────────┬────────────┬────────┐ │
   │  │ Login  │ Análise  │ Tipos de   │ Consumo│ │
   │  │        │          │ análise    │ tokens │ │
   │  └────────┴──────────┴────────────┴────────┘ │
   │                    │                         │
   │  NestJS + TypeORM + PostgreSQL               │
   │  ┌──────┬───────┬───────────┬──────────────┐ │
   │  │ auth │ users │ documents │ token-usage  │ │
   │  │ JWT  │ roles │  upload   │   custo      │ │
   │  └──────┴───────┴───────────┴──────────────┘ │
   └───────────────────┬──────────────────────────┘
                       │  documento + template
                       ▼
   ┌──────────────────────────────────────────────┐
   │              PIPELINE n8n                    │
   │                                              │
   │   ┌────────────────────────────────────┐     │
   │   │  Webhook (plataforma) │ Webhook API │     │
   │   └────────────────┬───────────────────┘     │
   │                    ▼                         │
   │   ┌────────────────────────────────────┐     │
   │   │  Converte base64 → binário         │     │
   │   └────────────────┬───────────────────┘     │
   │                    ▼                         │
   │   ┌────────────────────────────────────┐     │
   │   │  OCR DE DOCUMENTO                  │     │
   │   │  modelo prebuilt-layout            │     │
   │   │  preserva tabela e estrutura       │     │
   │   └────────────────┬───────────────────┘     │
   │                    ▼                         │
   │   ┌────────────────────────────────────┐     │
   │   │  POLLING                           │     │
   │   │  consulta → pronto? → aguarda      │──┐  │
   │   └────────────────┬───────────────────┘  │  │
   │                    │◄────────────────────-┘  │
   │                    ▼                         │
   │   ┌────────────────────────────────────┐     │
   │   │  SWITCH DE CAPACIDADE              │     │
   │   │  low · medium · high               │     │
   │   └────────────────┬───────────────────┘     │
   │                    ▼                         │
   │   ┌────────────────────────────────────┐     │
   │   │  ANÁLISE                           │     │
   │   │  system = template da instituição  │     │
   │   │  user   = texto extraído do doc    │     │
   │   │  temperatura baixa                 │     │
   │   └────────────────┬───────────────────┘     │
   │                    ▼                         │
   │   ┌────────────────────────────────────┐     │
   │   │  CÁLCULO DE CUSTO                  │     │
   │   │  tokens de entrada e saída         │     │
   │   └────────────────┬───────────────────┘     │
   │                    ▼                         │
   │   ┌────────────────────────────────────┐     │
   │   │  Persiste + responde à plataforma  │     │
   │   └────────────────────────────────────┘     │
   └──────────────────────────────────────────────┘
```

---

## Stack

**Frontend:** React · TypeScript · Vite · Tailwind CSS · React Router
**Backend:** NestJS · TypeORM · PostgreSQL · Passport JWT · bcrypt
**Pipeline:** n8n · OCR de documentos (modelo de layout) · LLM em nuvem

---

## Decisões técnicas

### OCR de layout, não OCR de texto

A extração usa modelo de análise de layout, não reconhecimento simples de
caracteres. A diferença importa em documento cartorial: matrícula tem estrutura
— averbações numeradas, blocos de registro, tabelas de confrontação. OCR que
devolve texto corrido destrói essa organização, e o modelo seguinte perde a
referência de qual informação pertence a qual averbação.

Preservar layout é o que permite ao modelo responder "consta alienação fiduciária
na averbação 7" em vez de "consta alienação fiduciária em algum lugar".

### Template como dado, não como código

O roteiro de análise não vive no prompt do fluxo. Ele é registro no banco,
editável pela plataforma, e entra como mensagem de sistema em tempo de execução.

Isso passa o controle para quem entende de crédito. A cooperativa cria um tipo de
análise para matrícula, outro para escritura, ajusta o que quer extrair conforme
a política muda — sem abrir chamado.

É a mesma ideia da base em documentos usada nos projetos de saúde deste
portfólio, aplicada a um domínio onde o roteiro muda com mais frequência que o
código.

### Polling explícito para processamento assíncrono

O serviço de OCR devolve um endereço de operação e processa em segundo plano. O
fluxo consulta, verifica se terminou, aguarda e repete.

Documento de vinte páginas leva tempo. Tratar isso como chamada síncrona
resultaria em timeout justamente nos documentos grandes, que são os que mais
precisam da automação.

### Faixa de capacidade selecionável

Um switch roteia entre três níveis conforme o que a plataforma envia. Documento
simples não precisa do modelo mais caro; matrícula com trinta averbações precisa.

A escolha fica com quem abre a análise, e o custo aparece na página de consumo —
o que torna a decisão informada em vez de arbitrária.

### Custo calculado e persistido por análise

Um nó dedicado calcula o custo a partir dos tokens de entrada e saída, e o
resultado é gravado junto com a análise.

Em instituição financeira, essa contabilidade não é enfeite: é o que permite
justificar o gasto, identificar o usuário que consome mais e projetar o custo de
escalar. Sem isso, IA vira linha de despesa que ninguém defende no orçamento.

### Dois pontos de entrada, um pipeline

Existe o webhook da plataforma e um webhook de API, para integração direta por
outro sistema. Ambos entram no mesmo processamento e divergem só na resposta.

Permite que a cooperativa integre a análise em outro fluxo interno sem duplicar a
lógica.

---

## Estrutura do repositório

```
50-notarial-document-analysis/
├── README.md
├── workflow.json           # pipeline n8n
└── platform/
    ├── frontend/           # React + Vite
    │   └── src/
    │       ├── pages/      # login, análise, tipos, usuários, consumo
    │       ├── components/
    │       ├── contexts/   # autenticação
    │       └── lib/        # cliente de API
    └── backend/            # NestJS
        ├── src/
        │   ├── auth/       # JWT, guards, roles
        │   ├── users/
        │   ├── documents/  # upload e envio ao pipeline
        │   ├── analysis-types/
        │   ├── token-usage/
        │   ├── entities/
        │   └── migrations/
        └── setup-database.sql
```

---

## Resultado

A leitura de documento cartorial deixou de ser trabalho manual de página por
página. O analista sobe o arquivo e recebe o parecer estruturado segundo o
roteiro da própria instituição.

E cada análise passou a ter custo conhecido, atribuído ao usuário que a executou —
o que permitiu à cooperativa tratar IA como despesa gerenciável em vez de conta
fechada no fim do mês.

---

## Rodando

**Pipeline:**

- [ ] Serviço de OCR de documentos — endpoint e chave
- [ ] Serviço de LLM — endpoint e chave
- [ ] PostgreSQL — persistência de análises e consumo

```
AZURE_DOCINTEL_ENDPOINT
AZURE_DOCINTEL_KEY
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_KEY
```

**Plataforma:**

```bash
# backend
cd platform/backend
cp .env.example .env      # preencher DB, JWT e URLs de webhook
npm install && npm run start:dev

# frontend
cd platform/frontend
cp .env.example .env
npm install && npm run dev
```

---

## Dívida técnica conhecida

**Ausência de testes.** Nem a plataforma nem o pipeline têm cobertura. Em sistema
que analisa documento de garantia para operação de crédito, os fluxos de upload,
cálculo de custo e persistência de resultado deveriam ter teste.

**Segredos no fluxo.** As chaves dos serviços de nuvem estavam em cabeçalho de nó
no workflow original. Foram movidas para variável de ambiente nesta versão; no
ambiente de origem, a migração para credencial gerenciada é pendência.

**Polling sem limite de tentativas.** O laço de consulta não tem número máximo de
iterações nem escalonamento para humano em caso de falha permanente do OCR.

---

> Sanitizado para publicação. Nome da instituição, endpoints, chaves de API,
> e-mails, hashes de senha e identificadores internos foram substituídos por
> valores fictícios. Nenhum documento ou dado de associado acompanha estes
> arquivos.
