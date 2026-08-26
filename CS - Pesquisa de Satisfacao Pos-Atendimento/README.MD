# Pesquisa de Satisfação Pós-Atendimento (CSAT)

Automação que entra em contato com o cliente 24 horas após o atendimento —
seja uma visita técnica ou um atendimento no SAC — coleta a avaliação por
WhatsApp, interpreta a resposta em linguagem natural e escala automaticamente
para o gestor quando o retorno é negativo.

- **Setor:** Telecom / ISP
- **Status:** Em produção
- **Escala:** 196 nós, duas fontes de dados, cinco agendadores independentes

---

## O problema

Pesquisa de satisfação em provedor de internet costuma falhar por três motivos:

**Ninguém faz.** Depende de alguém lembrar de ligar para cada cliente atendido
no dia anterior. Com dezenas de atendimentos diários, isso não escala e some na
primeira semana movimentada.

**A resposta não é estruturada.** O cliente não responde "nota 8". Ele responde
"foi bom mas ainda tá caindo de vez em quando" — que é uma nota alta para o
técnico e um problema aberto para a operação. Formulário com estrela perde
exatamente essa informação.

**Feedback ruim não vira ação.** Quando a avaliação negativa é registrada numa
planilha que alguém lê no fim do mês, o cliente insatisfeito já cancelou.

E há uma complicação de origem: o atendimento pode ter vindo de dois sistemas
diferentes — uma ordem de serviço no ERP (visita técnica) ou um ticket na
plataforma de SAC (atendimento remoto). Cada um tem estrutura, identificador e
ciclo próprios.

---

## A solução

O fluxo roda sozinho, em ciclos curtos, sobre as duas fontes:

**Coleta.** A cada execução, busca as OS concluídas nas últimas 24 horas no ERP
e os atendimentos encerrados no dia anterior na plataforma de SAC.

**Disparo.** Envia a pesquisa por WhatsApp usando template aprovado pela Meta,
com janela de espera antes do envio para não abordar o cliente logo após o
serviço.

**Interpretação.** Quando o cliente responde, um agente lê o histórico completo
da conversa — não só a última mensagem — e produz um mini-relatório do que o
cliente achou, já no formato que será gravado na OS de CS.

**Classificação.** Um classificador separa a resposta em positivo, negativo ou
aleatório. A terceira categoria existe porque parte das respostas não é
avaliação nenhuma: é o cliente perguntando outra coisa, mandando figurinha ou
respondendo fora de contexto.

**Ação.** Resposta positiva encerra o ciclo e registra a avaliação. Resposta
negativa abre OS de CS no ERP com o relatório anexado e escala para o setor
responsável. Sem resposta dentro da janela, o registro é finalizado sem
avaliação, e o cliente não é cobrado de novo.

---

## Arquitetura

```
   ┌──────────────────────┐        ┌──────────────────────┐
   │  ERP — OS concluídas │        │  SAC — atendimentos  │
   │  nas últimas 24h     │        │  encerrados ontem    │
   └──────────┬───────────┘        └──────────┬───────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
              ┌───────────────────────────────┐
              │  Fila de pesquisa (Supabase)  │
              │  deduplicação por cliente     │
              └───────────────┬───────────────┘
                              ▼
              ┌───────────────────────────────┐
              │  Disparo via template WhatsApp│
              │  (Cloud API, template Meta)   │
              └───────────────┬───────────────┘
                              │
                     aguarda resposta
                              │
              ┌───────────────▼───────────────┐
              │  Agente lê o histórico        │
              │  completo e gera relatório    │
              │  (memória em Postgres)        │
              └───────────────┬───────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Classificador  │
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          POSITIVO       NEGATIVO       ALEATÓRIO
              │              │              │
              │              ├─ abre OS de CS no ERP
              │              ├─ anexa o relatório
              │              └─ escala para o setor
              │
              └─ registra avaliação e encerra

   [sem resposta na janela] ──► finaliza sem avaliação, não recontata
```

---

## Integrações

| Sistema | Uso |
|---|---|
| ERP (IXC) | Busca OS concluídas, dados do cliente, contrato e login |
| SAC (OPA) | Lista atendimentos, mensagens e contatos |
| WhatsApp Cloud API | Disparo por template aprovado e recebimento via trigger |
| Supabase | Fila de pesquisa, controle de janela e resultados |
| Postgres | Memória de conversa dos agentes |
| OpenAI | Agente de interpretação e classificador |

---

## Decisões técnicas

### Duas fontes, um pipeline

OS de campo e ticket de SAC têm identificador, estrutura e ciclo diferentes. Em
vez de manter dois fluxos paralelos, ambos são normalizados para um formato
comum e entram na mesma fila. A ramificação volta a existir só no final, quando
o resultado precisa ser gravado no sistema de origem.

Isso mantém a lógica de interpretação e classificação em um lugar só — que é a
parte que muda com mais frequência.

### Interpretar em vez de pedir nota

A pesquisa é aberta, e um agente interpreta a resposta em linguagem natural. O
custo é maior que um formulário de estrelas; o ganho é que "foi bom mas ainda cai
às vezes" é corretamente tratado como problema aberto, e não como nota alta.

O agente lê o histórico completo da conversa, não a última mensagem. Cliente
frequentemente responde em várias mensagens curtas, e a informação relevante
raramente está na última.

### A terceira categoria

O classificador tem três saídas, não duas. A categoria "aleatório" existe porque
uma parte considerável das respostas não é avaliação — é o cliente aproveitando
o contato para perguntar outra coisa.

Com duas categorias, essas respostas seriam forçadas a positivo ou negativo,
contaminando a métrica e abrindo OS de CS sem motivo. É o tipo de detalhe que só
aparece depois de rodar em produção.

### Estado em banco, não na execução

Cada pesquisa disparada vira registro no Supabase, com controle de janela e
tabelas temporárias para o ciclo em andamento. O n8n roda a cada poucos minutos,
mas a conversa com o cliente pode durar horas.

Manter estado na execução do workflow quebraria em qualquer reinício. Em banco,
o fluxo é reiniciável e cada mensagem cai no contexto certo.

### Janela de silêncio

Cliente que não responde dentro da janela tem o registro finalizado sem
avaliação, e não é recontatado. Pesquisa insistente gera mais dano à percepção do
serviço do que o valor da resposta que ela captaria.

### Escalar com contexto, não só notificar

Avaliação negativa não gera um alerta solto. Abre OS de CS no sistema, com o
relatório do agente anexado, e encaminha para o setor responsável. Quem vai
tratar o caso recebe o problema já descrito e vinculado ao atendimento original.

---

## Resultado

Cobertura de pesquisa deixou de depender de alguém lembrar de ligar. Toda OS
concluída e todo atendimento de SAC entram na fila automaticamente.

Mais relevante: insatisfação passou a virar OS aberta no mesmo dia, com contexto,
em vez de linha em relatório mensal.

---

## Stack

`n8n` · `WhatsApp Cloud API` · `OpenAI` · `LangChain Agents` · `Supabase` ·
`PostgreSQL` · `IXC Provedor (REST)` · `OPA (REST)`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API
- [ ] Supabase — URL e service role key
- [ ] Postgres — memória de conversa dos agentes
- [ ] WhatsApp Cloud API — com templates aprovados pela Meta
- [ ] IXC — token do ERP
- [ ] OPA — token da plataforma de SAC

**Variáveis de ambiente:**

```
IXC_BASE_URL
OPA_BASE_URL
OPA_API_TOKEN
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Endpoints, tokens, telefones e nomes de
> tabela foram substituídos por valores fictícios. A lógica foi preservada.
