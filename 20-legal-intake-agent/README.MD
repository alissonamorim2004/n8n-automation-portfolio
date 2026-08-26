# Agente de Triagem e Agendamento para Escritório de Advocacia

Assistente de atendimento em WhatsApp para escritório de advocacia. Recepciona o
cliente, entende a natureza do caso, responde dúvidas jurídicas gerais sem
prometer resultado, e agenda a consulta direto no Google Agenda — com lembrete
personalizado antes do horário.

- **Setor:** Jurídico
- **Status:** Em produção
- **Escala:** 147 nós, agente principal com 5 sub-agentes, fila de 3 atendimentos simultâneos

---

## O problema

Escritório de advocacia perde cliente na porta de entrada, e por um motivo
específico: **quem procura advogado está num momento ruim**.

Divórcio, inventário, pensão, erro médico. A pessoa manda mensagem à noite, no
fim de semana, logo depois de um acontecimento difícil. Se não recebe resposta
rápida, procura outro escritório — e não porque o outro seja melhor, mas porque
respondeu.

Do outro lado, quem responde é a própria advogada ou uma secretária, e a maior
parte das mensagens é triagem repetida: "vocês fazem inventário?", "quanto custa
a consulta?", "atende minha cidade?". Tempo de advogado gasto em pergunta que não
exige advogado.

E aqui existe uma restrição que não existe na barbearia ou na clínica: **o Código
de Ética da OAB limita o que pode ser dito**. Não se promete resultado, não se
garante prazo, não se faz captação agressiva de cliente. Um agente que "vende" o
escritório ou diz "seu caso tem tudo para dar certo" não é só impreciso — é
infração ética que respinga na advogada.

---

## A solução

Um agente principal recepciona e delega para cinco sub-agentes, cada um com um
escopo estreito:

| Sub-agente | Escopo |
|---|---|
| **Serviços** | Áreas de atuação, valores de consulta, como funcionam os honorários |
| **Informações** | Dúvidas jurídicas técnicas, sempre sinalizando quando exige análise individual |
| **Sobre a advogada** | Formação, trajetória, credenciais e diferenciais do escritório |
| **FAQ** | Perguntas frequentes com resposta padronizada e revisada |
| **Agendador** | Executa consulta, criação e cancelamento no Google Agenda |

O agente principal nunca responde questão jurídica por conta própria: ele roteia,
recebe a informação do especialista e adapta a linguagem para o cliente.

Uma rotina paralela varre a agenda e dispara lembrete personalizado antes da
consulta, com local, assunto tratado e a lista de documentos que o cliente deve
levar.

---

## Arquitetura

```
   Cliente (WhatsApp)
        │
        ▼
   ┌────────────────────────────────┐
   │  Filtros: grupo? mensagem      │
   │  própria? LID?                 │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BLOQUEIO HUMANO (Redis)       │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  FILA (Redis) — máx. 3         │
   └──────────────┬─────────────────┘
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
   ┌────────────────────────────────────────────────┐
   │             AGENTE PRINCIPAL                   │
   │        memória em PostgreSQL (30 turnos)       │
   │                                                │
   │   ┌───────────┐ ┌───────────┐ ┌────────────┐   │
   │   │ Servicos  │ │ Informacao│ │ SobreDra   │   │
   │   └───────────┘ └───────────┘ └────────────┘   │
   │   ┌───────────┐ ┌──────────────────────────┐   │
   │   │   FAQ     │ │  Agendador               │   │
   │   └───────────┘ │   ├─ consultar (GCal)    │   │
   │                 │   ├─ agendar   (GCal)    │   │
   │   ┌───────────┐ │   └─ deletar   (GCal)    │   │
   │   │  Think    │ └──────────────────────────┘   │
   │   └───────────┘                                │
   │   cada sub-agente com memória própria          │
   └────────────────────┬───────────────────────────┘
                        ▼
              ┌──────────────────────┐
              │  Google Agenda       │
              │  Supabase (contatos, │
              │   1º contato x recorrente)
              └──────────────────────┘


   ROTINA DE LEMBRETE (agendada)

   Google Agenda + planilha de controle
        │
        ▼  faltam ~2h
   Agente monta lembrete personalizado
   (assunto tratado, local, documentos a levar)
        │
        ▼
   WhatsApp do cliente

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp (Evolution API) | Canal, mídia, marcação de lida, indicador de digitação |
| Google Calendar | Consulta de disponibilidade, criação e cancelamento |
| Google Sheets | Controle de lembretes enviados |
| Redis | Bloqueio humano, fila e buffer |
| PostgreSQL | Memória do agente principal e de cada sub-agente |
| Supabase | Contatos, primeiro contato e recorrência |
| OpenAI | Agentes, transcrição de áudio, visão e leitura de PDF |

---

## Decisões técnicas

### Guardrails de conformidade no prompt

O ponto que separa este fluxo de um agente de vendas comum. Regras explícitas em
todos os sub-agentes:

- **Nunca prometer resultado, êxito ou prazo judicial.** Quando a resposta
  depende de análise individual, o sub-agente é obrigado a sinalizar isso, e o
  agente principal encaminha para agendamento.
- **O agente é proibido de vender.** O objetivo declarado é agendar consulta.
  Valores só aparecem quando o cliente pergunta ou demonstra interesse direto —
  nunca como abordagem.
- **Honorários sempre remetem à tabela da OAB**, nunca a um número inventado.

Isso não é preciosismo: agente que promete resultado em causa jurídica expõe a
advogada a processo ético. O guardrail é requisito, não polimento.

### Assumir a condição de IA quando perguntado

O agente mantém persona e tom natural, mas há uma regra explícita: se o cliente
perguntar diretamente se está falando com uma IA, ele confirma e segue a conversa.

Negar seria mais "convincente" e é a escolha errada — em relação profissional
baseada em confiança, ser pego mentindo sobre isso custa mais que a conveniência
de parecer humano.

### Cinco sub-agentes com memória própria

Cada sub-agente tem modelo e memória separados. O de FAQ não improvisa sobre
credenciais; o de credenciais não estima honorários; o de agendamento não fala
com o cliente.

Em domínio jurídico, escopo estreito é redução de risco: o sub-agente erra menos
porque sabe menos, e o que ele sabe é texto revisado por quem responde pelo
escritório.

### Agendador como sub-agente, não ferramenta direta

O agente principal não chama o Google Agenda. Ele pede ao agendador, que valida
se tem todos os dados antes de executar e tem instrução explícita de nunca
inventar dado faltante — devolve ao principal dizendo o que falta.

Isso evita o erro clássico de agente com ferramenta de escrita: criar compromisso
com data alucinada porque o cliente disse "semana que vem".

### Distinção entre primeiro contato e recorrente

O Supabase registra se o número já apareceu antes. Cliente novo e cliente que já
tem processo em andamento não recebem a mesma recepção — o segundo não deveria
ouvir a apresentação institucional do escritório.

### Lembrete personalizado, não template

A rotina de lembrete usa um agente que puxa o assunto tratado na conversa e monta
a mensagem em cima dele, com local, horário e a lista de documentos pertinentes
ao caso.

Lembrete genérico é ignorado; lembrete que menciona o que a pessoa veio tratar
reduz falta — que em consulta jurídica é hora de advogado perdida.

### Fila de três e buffer

Mesmos padrões dos outros fluxos: no máximo três conversas simultâneas para
manter ritmo plausível, e agregação de mensagens fragmentadas em Redis antes de
processar.

---

## Resultado

O escritório passou a responder fora do horário comercial, que é justamente
quando a maior parte das mensagens chega em advocacia de família.

A triagem repetida saiu da mesa da advogada. O que chega até ela é consulta
agendada, com o assunto já identificado — e as respostas jurídicas gerais que o
cliente recebeu antes disso saíram de texto revisado, não de improviso.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `Redis` · `PostgreSQL` · `Supabase` ·
`Evolution API (WhatsApp)` · `Google Calendar API` · `Google Sheets API`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com transcrição e visão
- [ ] Evolution API — instância de WhatsApp
- [ ] Google Calendar — service account com acesso à agenda
- [ ] Google Sheets — planilha de controle de lembretes
- [ ] Redis — bloqueio, fila e buffer
- [ ] PostgreSQL — memória dos agentes
- [ ] Supabase — contatos e recorrência

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
GOOGLE_CALENDAR_ID
SHEET_ID_LEMBRETES
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Nome do escritório e da advogada,
> endereço, credenciais, telefones, e-mails, IDs de agenda e planilha, número de
> OAB e CNPJ foram substituídos por valores fictícios. Nenhum dado de cliente
> acompanha este arquivo. A arquitetura e os guardrails foram preservados.
