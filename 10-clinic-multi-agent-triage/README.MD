# Atendimento e Pré-qualificação com IA para Clínica Médica

Assistente de atendimento em WhatsApp para clínica de gastroenterologia e
diagnóstico por imagem. Conduz a pré-qualificação do paciente sobre uma base de
conhecimento de 27 médicos e dezenas de procedimentos, e encaminha para a
secretaria humana com o caso já resumido.

- **Setor:** Saúde
- **Status:** Em produção
- **Escala:** 231 nós, 27 médicos e ~30 categorias de exame como ferramentas, fila de 3 atendimentos simultâneos

---

## O problema

Clínica com 27 médicos e mais de trinta categorias de exame tem um problema de
atendimento que não é volume — é **roteamento correto**.

A pergunta que chega é "vocês fazem ressonância?" ou "quanto custa endoscopia?".
Responder exige saber qual médico faz o quê, quais procedimentos precisam de
sedação, quais atendem criança, qual exige preparo, o que a clínica não realiza,
e quando o caso precisa passar pelo financeiro em vez da agenda.

Antes, isso vivia na cabeça das secretárias. Consequências:

**Informação errada custa caro.** Paciente agendado com o especialista errado
perde a viagem, ocupa uma vaga de agenda e volta insatisfeito.

**A carga bate toda no mesmo lugar.** Onze pessoas na recepção respondendo
pergunta repetida de triagem, enquanto quem já está na clínica espera.

**Fora do horário ninguém responde.** E paciente com sintoma não espera até
segunda para procurar outro lugar.

Havia ainda uma restrição que descarta a solução simples: em saúde, **inventar
resposta é inaceitável**. Um agente que "acha" que determinado médico faz
determinado exame, ou que estima um preço, gera dano real. O sistema precisava
ser incapaz de responder fora da base de conhecimento oficial.

---

## A solução

Um agente principal atende e delega para sub-agentes especializados, cada um
ancorado em documentos mantidos pela própria clínica.

**Base de conhecimento viva.** Cada médico é um documento. Cada categoria de
exame é um documento. A clínica edita o documento; o agente passa a responder
diferente na conversa seguinte — sem deploy, sem mexer em prompt.

**Delegação por domínio.** O agente principal identifica a natureza da pergunta e
aciona o sub-agente certo: médicos, categorias de serviço, exames, atendimento
infantil, secretaria.

**Escalonamento com contexto.** Quando o caso precisa de humano, o agente aciona
a ferramenta de encaminhamento correspondente — agendamento, financeiro ou
administração — e envia o resumo do paciente já formatado: nome, sintoma relatado
e o que ele procura.

**Bloqueio ao assumir.** Quando a secretária assume o atendimento na plataforma,
uma chave de bloqueio é gravada e o agente para de responder aquele número.

**Fila de três simultâneos.** O sistema atende no máximo três conversas ao mesmo
tempo, por decisão de produto — explicada abaixo.

---

## Arquitetura

```
   Paciente (WhatsApp Business API oficial)
        │
        ▼
   ┌────────────────────────────────┐
   │  Filtros de entrada            │
   │  grupo? mensagem própria?      │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BLOQUEIO HUMANO (Redis)       │  secretária assumiu → agente cala
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  FILA DE ATENDIMENTO (Redis)   │  máx. 3 conversas simultâneas
   │  atendimento1 / 2 / 3          │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BUFFER DE MENSAGENS (Redis)   │  agrega mensagens fragmentadas
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  NORMALIZAÇÃO DE MÍDIA         │  áudio → transcrição
   │  texto / áudio / imagem / PDF  │  imagem, PDF → extração
   └──────────────┬─────────────────┘
                  ▼
   ┌─────────────────────────────────────────────────────┐
   │              AGENTE PRINCIPAL                       │
   │         memória de conversa em PostgreSQL           │
   │                                                     │
   │   SUB-AGENTES              FERRAMENTAS DE ESCALONAMENTO
   │   ┌──────────────┐         ┌──────────────────────┐ │
   │   │ medicos      │──┐      │ encaminhar (agenda)  │ │
   │   │  27 docs     │  │      │ financeiro           │ │
   │   ├──────────────┤  │      │ administração        │ │
   │   │ exames       │──┤      └──────────────────────┘ │
   │   │  ~15 docs    │  │                               │
   │   ├──────────────┤  ├──► Google Docs (base viva)    │
   │   │ categorias   │──┤                               │
   │   │  ~12 docs    │  │                               │
   │   ├──────────────┤  │      Think (raciocínio)       │
   │   │ crianca      │──┤      Calculator (datas)       │
   │   ├──────────────┤  │                               │
   │   │ secretarias  │──┘                               │
   │   └──────────────┘                                  │
   └───────────────────────┬─────────────────────────────┘
                           ▼
              ┌────────────────────────────┐
              │  Plataforma de atendimento │
              │  ticket + resumo do caso   │
              │  para a secretaria humana  │
              └────────────────────────────┘

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp Business API (Meta) | Canal oficial, mídia, templates |
| Google Docs | Base de conhecimento por médico e por categoria de exame |
| Redis | Bloqueio humano, fila de atendimento e buffer de mensagens |
| PostgreSQL | Memória de conversa do agente e sub-agentes |
| Supabase | Registro de contatos, reações e histórico |
| Plataforma de atendimento | Criação de ticket e roteamento para secretaria |
| OpenAI | Agente, sub-agentes, transcrição e visão |
| ConvertAPI | Conversão de documentos enviados pelo paciente |

---

## Decisões técnicas

### Base de conhecimento em Google Docs, não em prompt

Esta é a decisão central. Cada um dos 27 médicos e cada categoria de exame é um
documento acessado como ferramenta.

Duas alternativas foram descartadas:

**Tudo no system prompt.** Com 27 médicos e trinta categorias, o prompt fica
enorme, o custo por mensagem explode e o modelo começa a confundir quem faz o
quê. Pior: cada alteração de corpo clínico vira alteração de código.

**Vector store com RAG semântico.** Melhor em custo, mas recuperação aproximada
em saúde é risco. "Qual médico faz colonoscopia" precisa de resposta exata, não
do trecho mais parecido. A recuperação aqui é determinística: um documento por
entidade, buscado pela entidade.

E o ganho operacional decide: a secretária edita o documento do médico no Google
Docs e o agente responde diferente na próxima conversa. A clínica mantém a
própria base, sem depender de mim.

### Sub-agente por domínio, não um agente onisciente

O agente principal roteia; os sub-agentes respondem. Cada sub-agente tem memória
e modelo próprios e enxerga só os documentos do seu domínio.

Isso reduz a superfície de erro: o sub-agente de exames não tem como responder
sobre corpo clínico, e o de médicos não estima preço. Cada um erra menos porque
sabe menos.

### Fila de três atendimentos simultâneos

Decisão de produto, não limitação técnica. O sistema poderia atender trinta em
paralelo.

O motivo é percepção: uma recepção real não responde trinta pessoas no mesmo
segundo. Resposta instantânea e simultânea em massa denuncia automação, e em
saúde isso reduz a confiança do paciente na informação que ele acabou de receber.
Limitar a três mantém o ritmo plausível.

O controle é feito com chaves em Redis, e não com concorrência do n8n, porque
precisa sobreviver a reinício.

### Escalonamento em três destinos, não um só

Agenda, financeiro e administração são ferramentas distintas. O agente escolhe
o destino pela natureza do caso, e envia junto o resumo estruturado do paciente.

A secretária que assume não recebe "cliente quer falar" — recebe o caso já
qualificado, e continua de onde o agente parou.

### Bloqueio humano com estado em Redis

Ao assumir o atendimento na plataforma, a chave de bloqueio é gravada e o agente
silencia para aquele número. Em contexto clínico isso é crítico: um agente
respondendo por cima de uma secretária que está tratando um caso sensível é dano
imediato.

### Não inventar é regra explícita

O prompt proíbe informar valores e afirmar disponibilidade sem consultar a
ferramenta correspondente. Quando a informação não existe na base, o caminho não
é o agente supor — é escalar para humano.

### Buffer de mensagens

Mesmo padrão dos outros fluxos: paciente escreve em mensagens curtas e
sequenciais. As mensagens são agregadas em Redis e entregues ao agente como uma
só, com janela de espera antes do processamento.

### Áudio, imagem e PDF na entrada

Paciente manda áudio descrevendo sintoma e foto de pedido médico. Ambos são
normalizados para texto antes de chegar ao agente — transcrição para áudio, visão
e extração para imagem e PDF. Sem isso, metade das mensagens seria ignorada.

---

## Resultado

A pré-qualificação deixou de depender da memória de quem está na recepção. A
resposta sobre corpo clínico e procedimento passou a vir sempre da base oficial
da clínica.

Para as secretárias, a mudança é de natureza: em vez de responder a mesma
pergunta de triagem dezenas de vezes por dia, elas recebem casos já resumidos e
roteados para o setor certo.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `Redis` · `PostgreSQL` · `Supabase` ·
`WhatsApp Business API (Meta)` · `Google Docs API` · `ConvertAPI`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com transcrição e visão
- [ ] WhatsApp Business API (Meta) — token e templates aprovados
- [ ] Google Docs — service account com acesso à base
- [ ] Redis — bloqueio, fila e buffer
- [ ] PostgreSQL — memória dos agentes
- [ ] Supabase — contatos e histórico
- [ ] ConvertAPI — conversão de documentos

**Variáveis de ambiente:**

```
META_WHATSAPP_TOKEN
META_PHONE_NUMBER_ID
SUPABASE_URL
SUPABASE_KEY
CONVERTAPI_TOKEN
PLATAFORMA_BASE_URL
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Nome e localização da clínica, nomes de
> médicos e secretárias, telefones, e-mails, IDs de documentos e credenciais
> foram substituídos por valores fictícios. Nenhum dado de paciente acompanha
> este arquivo. A arquitetura e a lógica de atendimento foram preservadas.
