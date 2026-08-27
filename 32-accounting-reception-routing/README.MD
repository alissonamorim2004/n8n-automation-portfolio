# Recepção e Roteamento por Setor para Escritório Contábil

Assistente de recepção em WhatsApp para contabilidade digital. Identifica o
assunto do cliente, transfere para um dos seis setores da plataforma de
atendimento, e opera três rotinas paralelas: envio de guias de imposto,
fechamento automático de chamados ociosos e controle de horário de expediente.

- **Setor:** Contabilidade / Serviços financeiros
- **Status:** Em produção
- **Escala:** 196 nós, 6 setores, 7 rotinas agendadas, integração com plataforma de atendimento multicanal

---

## O problema

Escritório contábil tem um problema de atendimento diferente de clínica ou
barbearia: **o cliente não sabe com quem ele precisa falar.**

"Preciso do meu boleto" pode ser Financeiro (mensalidade do escritório) ou
Impostos (guia de tributo). "Quero emitir uma nota" é Fiscal, não Financeiro.
"Imposto de Renda" não tem setor próprio. Cliente novo é sempre Comercial, mesmo
perguntando sobre folha de pagamento.

Essas distinções são óbvias para quem trabalha no escritório e invisíveis para
quem está do lado de fora. O resultado antes era previsível:

**Chamado circulando entre setores.** Cliente caía no Financeiro, era transferido
para o Fiscal, que devolvia para o Contábil. Três esperas para uma pergunta.

**Recepção como gargalo.** Alguém tinha que ler cada mensagem e decidir o destino.
Fora do horário, ninguém decidia nada.

**Chamados abandonados abertos.** Cliente perguntava, recebia resposta, sumia. O
chamado ficava aberto ocupando a fila, e alguém precisava fechar manualmente.

Havia ainda um trabalho recorrente e puramente mecânico: **enviar guia de FGTS e
de Simples Nacional para centenas de clientes, todo mês**, cada um com o seu
arquivo, conferindo quem já recebeu.

---

## A solução

### Recepção e roteamento

Um agente recepciona, identifica o assunto e transfere para o setor correto na
plataforma de atendimento. As regras de negócio de roteamento estão codificadas
de forma explícita — treze delas, incluindo as exceções que causavam o
ping-pong:

- Faturamento e nota fiscal vão para Fiscal, nunca para Financeiro
- Boleto e honorários do escritório vão para Financeiro, nunca para Fiscal
- Imposto de Renda de pessoa física vai para Contabilidade, por não haver setor próprio
- Cliente novo vai obrigatoriamente para Comercial
- Cliente que já tem contabilidade em outro escritório vai para Comercial com comentário específico

Cada setor tem um webhook próprio, e a transferência carrega um comentário com o
assunto identificado — quem atende já sabe do que se trata.

### Rotinas agendadas

| Rotina | Cadência | Função |
|---|---|---|
| Envio de FGTS/INSS | diária | Distribui guias por cliente, controlando quem já recebeu |
| Envio de Simples Nacional | diária | Idem, com planilha de controle |
| Fechamento de chamado ocioso | a cada 10 min | Fecha chamados sem resposta há mais de 30 min |
| Controle de expediente | a cada 10 min | Verifica dia e horário úteis |
| Limpeza de planilha | diária | Zera o controle do ciclo |
| Limpeza de memória | diária, 23h | Expira contexto de conversa |

---

## Arquitetura

```
   Cliente (WhatsApp via plataforma multicanal)
        │
        ▼
   ┌────────────────────────────────┐
   │  BUFFER DE MENSAGENS (Redis)   │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  NORMALIZAÇÃO DE MÍDIA         │
   │  áudio · imagem · PDF          │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  ESTÁ NA RECEPÇÃO?             │  se já foi transferido,
   │  bloqueio por departamento     │  o agente não intervém
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────────────────┐
   │           AGENTE RECEPCIONISTA             │
   │        memória em PostgreSQL               │
   │                                            │
   │   ┌────────────────────────────────────┐   │
   │   │  trocasetor                        │   │
   │   │  13 regras de roteamento           │   │
   │   │                                    │   │
   │   │  Comercial · Contabilidade ·       │   │
   │   │  Pessoal · Financeiro ·            │   │
   │   │  Imposto/Fiscal · Legalidade       │   │
   │   └────────────────────────────────────┘   │
   └────────────────────┬───────────────────────┘
                        ▼
           ┌────────────────────────────┐
           │  Plataforma de atendimento │
           │  transfere + comenta       │
           └────────────────────────────┘


   ROTINAS AGENDADAS (independentes)

   ├── FGTS/INSS ────────► busca contatos por tag → envia guia
   │                        → registra na planilha
   ├── Simples Nacional ─► mesmo padrão, com controle próprio
   ├── Chamado ocioso ───► sem resposta há 30 min → fecha
   ├── Expediente ───────► dia útil? dentro do horário?
   ├── Limpa planilha ───► zera controle do ciclo
   └── Limpa memória ────► expira contexto às 23h

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| Plataforma de atendimento multicanal | Contatos, tags, tickets, transferência, envio, fechamento |
| Google Sheets | Controle de envio de guias por cliente |
| Redis | Buffer de mensagens e bloqueio |
| PostgreSQL | Memória de conversa |
| Supabase | Registro de atendimentos e controle de estado |
| OpenAI | Agente, transcrição de áudio, visão e leitura de PDF |

---

## Decisões técnicas

### Regras de negócio explícitas, não inferência

As treze regras de roteamento estão escritas literalmente no sub-agente. Não é
"entenda o contexto e escolha o setor" — é uma tabela de decisão.

O motivo é que as distinções aqui são arbitrárias, não semânticas. Nada em
"boleto" indica se é mensalidade do escritório ou guia de tributo; a diferença é
convenção interna. Um modelo raciocinando sozinho acerta a maioria e erra
justamente nos casos ambíguos, que são os que mais custam.

Regra explícita transforma o modelo em classificador com gabarito, e o gabarito
é editável por quem conhece o negócio.

### Transferir primeiro, comunicar depois

Instrução explícita: acionar a ferramenta de transferência **antes** de avisar o
cliente.

A ordem inversa cria uma janela em que o agente prometeu transferir e ainda não
transferiu. Se algo falha nesse intervalo, o cliente fica esperando um
atendimento que nunca chega. Executar primeiro garante que a mensagem só existe
se a ação aconteceu.

### Uma transferência por atendimento

Regra rígida: nunca transferir duas vezes. Se o cliente muda de assunto depois de
transferido, o agente orienta a aguardar o setor atual.

Sem esse limite, cliente indeciso ricocheteia entre setores e nenhum atendente
consegue assumir o caso. É a versão automatizada do problema que o sistema veio
resolver.

### Bloqueio por departamento, não por conversa

Diferente dos outros fluxos, aqui o bloqueio verifica **em qual departamento o
chamado está**. Se já saiu da recepção, o agente não intervém.

Isso funciona melhor com plataforma multicanal: o estado de quem atende já vive
na plataforma, e duplicar esse controle em Redis criaria duas fontes de verdade
que divergem.

### Fechamento por ociosidade com cálculo próprio

Um nó dedicado calcula o tempo desde a última mensagem e fecha chamados parados
há mais de 30 minutos, verificando antes se a última mensagem foi do cliente ou
do atendente.

Fechar chamado onde o cliente falou por último seria fechar na cara dele. A
verificação de quem falou por último é o que separa limpeza de fila de mau
atendimento.

### Envio de guias com controle de idempotência

As rotinas de FGTS e Simples Nacional buscam contatos por tag, enviam o arquivo e
registram na planilha. A planilha é consultada antes do envio.

Em envio mensal de guia para centenas de clientes, mandar duas vezes gera
confusão sobre qual guia é a válida — e em contabilidade isso vira ligação de
cliente preocupado com pagamento duplicado.

### Expiração de memória

A memória de conversa é limpa diariamente. Contexto de contabilidade tem validade
curta: a dúvida de ontem sobre uma guia não deve influenciar o atendimento de
hoje sobre folha de pagamento.

---

## Resultado

O roteamento entre seis setores deixou de depender de alguém ler cada mensagem e
decidir. As regras que antes viviam na experiência da recepcionista viraram
tabela explícita, editável e aplicada de forma consistente — inclusive fora do
horário comercial.

O envio mensal de guias, que era trabalho manual repetido por centenas de
clientes, passou a rodar sozinho com controle de quem já recebeu.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `Redis` · `PostgreSQL` · `Supabase` ·
`Google Sheets API` · `Plataforma de atendimento multicanal (REST)`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com transcrição e visão
- [ ] Plataforma de atendimento — token de API
- [ ] Google Sheets — planilhas de controle de envio
- [ ] Redis — buffer e bloqueio
- [ ] PostgreSQL — memória de conversa
- [ ] Supabase — registro de atendimentos

**Variáveis de ambiente:**

```
DIGISAC_BASE_URL
DIGISAC_TOKEN
SHEET_ID_CONTROLE
DEPARTAMENTO_IDS       # um por setor
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Razão social, CNPJ, endereço, nome de
> responsável, domínios, token de API, IDs de departamento e contato, e ID de
> planilha foram substituídos por valores fictícios. Nenhum dado de cliente
> acompanha este arquivo. As regras de roteamento foram preservadas.
