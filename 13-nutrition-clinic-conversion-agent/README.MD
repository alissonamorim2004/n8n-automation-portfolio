# Agente de Conversão para Clínica de Endocrinologia e Nutrição

Assistente de atendimento em WhatsApp para consultório médico particular e por
convênio. Diferente dos outros agentes de saúde deste portfólio, o objetivo
declarado aqui não é triagem — é **converter contato em consulta agendada**,
navegando uma tabela de preços que depende de convênio, tipo de procedimento e
histórico do paciente.

- **Setor:** Saúde / Endocrinologia e nutrição
- **Status:** Em produção
- **Escala:** 101 nós, agente com ferramenta de serviços e escalonamento para secretaria

---

## O problema

Consultório particular perde paciente na resposta a "quanto custa?" — e não por
causa do preço, mas porque **a resposta correta depende de coisas que o paciente
não informou.**

A tabela real é combinatória:

| Situação | Valor |
|---|---|
| Consulta particular, primeira vez | preço A |
| Consulta particular, paciente já atendido | preço B (menor) |
| Consulta por convênio | sem cobrança ao paciente |
| Exame de composição corporal isolado | preço C |
| Exame junto com consulta por convênio | preço D |
| Exame junto com consulta particular | preço C + A ou B |

Seis combinações a partir de três variáveis: convênio ou particular, primeira vez
ou retorno, procedimento isolado ou combinado.

Isso gera três falhas:

**Resposta errada custa o paciente.** Informar o valor cheio para quem tem
convênio afasta alguém que não pagaria nada.

**Resposta genérica não converte.** "Depende, me chama pra gente conversar" é o
que o consultório respondia — e o paciente não chama de volta.

**A secretária vira gargalo de tabela.** A maior parte das mensagens é
consulta de preço que segue uma regra fixa.

E há uma particularidade clínica: o exame de composição corporal exige jejum e só
roda em dias específicos. Agendar sem avisar disso gera paciente que aparece e não
pode fazer.

---

## A solução

Um agente atende com objetivo comercial explícito e uma ferramenta que carrega a
tabela e as regras de combinação.

**Pergunta antes de responder o preço.** Ao ser questionado sobre valor, o agente
identifica primeiro convênio ou particular, e se é primeira consulta ou retorno.
Só então informa — o valor correto para aquela pessoa.

**Regras de procedimento embutidas.** A ferramenta sabe que o exame isolado é só
particular, que exige jejum, e em quais dias roda. Essas condições aparecem no
momento do agendamento, não depois.

**Escalonamento por tipo, não por dificuldade.** Agendamento de exame vai para a
secretaria com resumo estruturado: nome, motivo, convênio ou particular, primeira
vez ou recorrente, resumo da conversa.

**Separação explícita entre agente e médica.** Regra no prompt: quando o paciente
envia exames, o agente diz que vai chamar a médica ou a secretaria — nunca
responde como se fosse ela.

**Distinção entre primeiro contato e recorrente**, registrada no banco, para
ajustar a recepção.

---

## Arquitetura

```
   Paciente (WhatsApp)
        │
        ▼
   ┌────────────────────────────────┐
   │  Filtros: grupo? própria? LID? │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BLOQUEIO HUMANO (Redis)       │
   │  dupla verificação             │
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
   ┌────────────────────────────────┐
   │  PRIMEIRO CONTATO? (Supabase)  │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────────────────┐
   │              AGENTE                        │
   │      memória em PostgreSQL, 30 turnos      │
   │                                            │
   │   ┌──────────────────────────────────┐     │
   │   │  servicos                        │     │
   │   │  tabela combinatória de preço    │     │
   │   │  + regras de procedimento        │     │
   │   │    (jejum, dias, particular)     │     │
   │   └──────────────────────────────────┘     │
   │   ┌──────────────┐  ┌──────────────────┐   │
   │   │ Calculator   │  │ Think            │   │
   │   │ datas        │  │                  │   │
   │   └──────────────┘  └──────────────────┘   │
   │   ┌──────────────────────────────────┐     │
   │   │  secretaria                      │     │
   │   │  nome · motivo · convênio ·      │     │
   │   │  1ª vez? · resumo                │     │
   │   └──────────────────────────────────┘     │
   └────────────────────┬───────────────────────┘
                        ▼
              ┌──────────────────────┐
              │  Secretaria assume   │
              │  (cria bloqueio)     │
              └──────────────────────┘

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp (Evolution API) | Canal, mídia, presença, marcação de lida |
| Redis | Bloqueio humano e buffer de mensagens |
| PostgreSQL | Memória de conversa, janela de 30 turnos |
| Supabase | Cadastro de contatos, primeiro contato e recorrência |
| OpenAI | Agente, transcrição de áudio, visão e leitura de PDF |

---

## Decisões técnicas

### Qualificar antes de precificar

A regra central. O agente não responde valor sem antes saber convênio ou
particular, e primeira vez ou retorno.

É contraintuitivo em atendimento comercial — o instinto é responder rápido para
não perder o interessado. Mas com tabela combinatória, resposta rápida é resposta
errada em cinco de seis casos, e resposta errada afasta mais que demora de dez
segundos.

A qualificação também produz o dado que a secretaria precisa quando assume.

### A tabela vive na ferramenta, não no prompt principal

Preços e regras de combinação ficam num sub-agente consultado sob demanda.

Preço muda. Convênio entra e sai. Colocar isso no prompt principal significa mexer
no comportamento do agente toda vez que a tabela muda — e prompt principal é o
lugar onde uma alteração descuidada quebra o atendimento inteiro. Isolado, o risco
de uma atualização de preço fica contido.

### Restrição clínica no momento do agendamento

O jejum e os dias disponíveis para o exame são informados quando o paciente
manifesta interesse, não depois de agendar.

Paciente que aparece sem jejum perde a viagem e o horário fica ocioso. É o tipo de
regra que parece detalhe operacional e é a diferença entre agendamento e
agendamento cumprido.

### O agente nunca fala como a médica

Regra explícita: ao receber exames, encaminhar para a médica ou a secretaria,
deixando claro quem vai responder.

Em consultório, o paciente que acha estar falando com a médica interpreta qualquer
frase como orientação clínica. A separação evita que uma resposta administrativa
seja lida como conduta médica.

### Uma pergunta por mensagem

Instrução literal no prompt, com proibição de preâmbulo ("Claro!", "Com certeza!").

Mensagem longa com três perguntas é respondida pela metade, e a conversa
descarrila. O padrão se repete nos outros agentes deste portfólio porque o efeito
é consistente.

### Dupla verificação de bloqueio

O estado de bloqueio é checado em dois pontos do fluxo, em ramos distintos de
entrada. Redundância deliberada: agente respondendo por cima da secretária em
conversa sobre exame é o pior erro possível aqui.

---

## Resultado

A pergunta de preço — o contato mais frequente e o mais fácil de errar — passou a
ser respondida com o valor correto para a situação de cada paciente, em vez de
"depende, me chama".

A secretária deixou de ser consultada como tabela de preços e passou a receber
casos qualificados, com convênio e histórico já identificados.

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
- [ ] PostgreSQL — memória do agente
- [ ] Supabase — contatos e recorrência

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
WEBHOOK_ENCAMINHAR_URL
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Nome da médica, razão social, CNPJ,
> e-mail, redes sociais, nome do convênio, telefones, credenciais e cerca de 150
> identificadores internos foram substituídos por valores fictícios. Nenhum dado
> de paciente acompanha este arquivo.
