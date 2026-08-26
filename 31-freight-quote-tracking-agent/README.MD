# Agente de Cotação e Rastreio para Transportadora

Assistente de atendimento em WhatsApp para transportadora rodoviária de cargas.
Recepciona o cliente, identifica se o pedido é cotação, coleta, rastreio ou
avaria, coleta os dados obrigatórios de cada caso e entrega o pedido estruturado
ao setor responsável.

- **Setor:** Logística / Transporte rodoviário de cargas
- **Status:** Em produção
- **Escala:** 84 nós, agente com 4 sub-agentes, roteamento por tipo de solicitação

---

## O problema

Cotação de frete não é uma pergunta — é **um formulário disfarçado de conversa**.

Para cotar uma coleta, o consultor precisa de: solicitante, telefone, CNPJ do
remetente, endereço de coleta, CNPJ do destinatário, volumes, peso, medidas
(altura, comprimento e largura), classificação de risco, tipo de mercadoria e
janela de horário — incluindo parada para almoço, que muda a viabilidade da rota.

Onze campos. E o cliente sempre manda três: "quanto custa levar uma carga pra São
Paulo?".

O que acontecia antes:

**Ida e volta interminável.** O consultor pedia um dado, o cliente respondia horas
depois, faltava outro. Uma cotação levava um dia para sair do estágio de coleta
de informação.

**Cotação incompleta chegando ao setor.** Consultor recebia o pedido faltando
peso ou classificação de risco, e devolvia — ou pior, cotava errado.

**Tudo entrava pelo mesmo canal.** Cotação, rastreio de carga e reclamação de
avaria chegavam no mesmo WhatsApp, e alguém tinha que triar manualmente. Avaria é
urgente e sensível; rastreio é consulta rápida; cotação é comercial. Tratamentos
completamente diferentes na mesma fila.

---

## A solução

Um agente atende e roteia por tipo de solicitação, com sub-agentes especializados:

| Sub-agente | Função |
|---|---|
| **Serviços** | Explica os tipos de transporte: carga liberada, fracionada, perigosa, EADI |
| **Coleta/Envio** | Guarda a checklist de campos obrigatórios de cada tipo de pedido |
| **Cotação** | Valida se os dados estão completos e formata o pedido para o setor comercial |
| **Rastreio/Avaria** | Roteia para o fluxo específico de cada caso |

O sub-agente de coleta é o núcleo: ele conhece os onze campos da coleta e os cinco
do envio, e o agente principal usa isso para ir pedindo o que falta ao longo da
conversa, em ritmo natural — não como formulário.

Quando o pedido está completo, ele é formatado e enviado ao grupo de consultores,
com o número do cliente já incluído. O consultor assume dali, com tudo em mãos.

---

## Arquitetura

```
   Cliente (WhatsApp)
        │
        ▼
   ┌────────────────────────────────┐
   │  Filtros: grupo? própria? LID? │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BLOQUEIO HUMANO (Redis)       │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BUFFER DE MENSAGENS (Redis)   │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  NORMALIZAÇÃO DE MÍDIA         │
   │  áudio · imagem                │
   └──────────────┬─────────────────┘
                  ▼
   ┌──────────────────────────────────────────────┐
   │            AGENTE PRINCIPAL                  │
   │         memória em PostgreSQL                │
   │                                              │
   │   ┌──────────┐  ┌──────────────┐             │
   │   │ servicos │  │ coleta/envio │ ← checklist │
   │   └──────────┘  └──────────────┘   de campos │
   │   ┌──────────┐  ┌──────────────────────────┐ │
   │   │  Think   │  │ cotacao → valida e       │ │
   │   └──────────┘  │           formata        │ │
   │                 └──────────────────────────┘ │
   │                 ┌──────────────────────────┐ │
   │                 │ avaria/rastreio → roteia │ │
   │                 └──────────────────────────┘ │
   └───────────────────────┬──────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌────────────────────┐    ┌────────────────────┐
   │  Fluxo de cotação  │    │  Fluxo de avaria   │
   │  agente formata e  │    │  ou rastreio       │
   │  envia ao grupo de │    │                    │
   │  consultores       │    │                    │
   └────────────────────┘    └────────────────────┘
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp (Evolution API) | Canal, mídia, presença, marcação de lida |
| Redis | Bloqueio humano e buffer de mensagens |
| PostgreSQL | Memória do agente principal e sub-agentes |
| Supabase | Registro de atendimentos |
| OpenAI | Agentes, transcrição de áudio e visão |
| Webhooks internos | Fluxos de cotação, avaria e rastreio |

---

## Decisões técnicas

### Checklist como sub-agente, não como script

A tentação em cotação é fazer um fluxo linear: pergunta 1, guarda, pergunta 2,
guarda. Funciona até o cliente responder duas coisas de uma vez, ou responder
fora de ordem, ou perguntar outra coisa no meio.

Aqui a checklist vive num sub-agente que o agente principal consulta. O principal
conduz a conversa livremente e vai marcando o que já tem. Cliente que manda peso e
medidas juntos é entendido; cliente que pergunta sobre carga perigosa no meio da
cotação é respondido e a coleta continua de onde parou.

### Validação antes de enviar ao consultor

O sub-agente de cotação tem instrução explícita de exigir o nome do cliente antes
de encaminhar, e de pedir o que estiver faltando em vez de enviar incompleto.

Esse é o ponto que decide se o sistema é usado ou abandonado: cotação incompleta
chegando ao consultor faz o time perder confiança na automação em uma semana. É
melhor o agente insistir com o cliente do que empurrar lixo para o setor.

### Número do cliente injetado, não pedido

O número do cliente é extraído do próprio contexto do WhatsApp e injetado no
pedido de cotação — o agente não pergunta.

Parece detalhe, mas é um campo a menos numa checklist de onze, e é o campo que o
sistema já sabe. Pedir dado que você já tem é o erro mais comum em coleta
conversacional.

### Variação no modelo de mensagem ao grupo

Instrução explícita para o agente variar a formatação do pedido enviado ao grupo
de consultores, mantendo o mesmo conteúdo.

O motivo é prático: mensagem idêntica repetida vira ruído visual e o time para de
ler com atenção. Variar a forma mantém o pedido legível.

### Três destinos, não um

Cotação, rastreio e avaria seguem por fluxos separados. Avaria envolve carga
danificada e cliente insatisfeito; rastreio é consulta operacional; cotação é
comercial.

Rotear no agente, e não deixar para o humano triar, é o que tira a fila de
triagem manual do meio do caminho.

### Bloqueio humano e buffer

Mesmos padrões dos demais fluxos: chave em Redis silencia o agente quando um
consultor assume, e mensagens fragmentadas são agregadas antes do processamento.

---

## Resultado

A coleta de dados de cotação deixou de consumir ida e volta entre cliente e
consultor. O pedido chega ao setor comercial completo e formatado, com o contato
do cliente incluído.

E a triagem entre cotação, rastreio e avaria passou a acontecer na entrada, em
vez de depender de alguém lendo a fila e distribuindo.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `Redis` · `PostgreSQL` · `Supabase` ·
`Evolution API (WhatsApp)`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com transcrição e visão
- [ ] Evolution API — instância de WhatsApp
- [ ] Redis — bloqueio e buffer
- [ ] PostgreSQL — memória dos agentes
- [ ] Supabase — registro de atendimentos

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
WHATSAPP_GRUPO_CONSULTORES
WEBHOOK_COTACAO_URL
WEBHOOK_AVARIA_URL
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Razão social, CNPJ, endereços de matriz e
> filial, telefones, e-mails, domínio e credenciais foram substituídos por
> valores fictícios. A arquitetura e as checklists de coleta foram preservadas.
