# Motor de Espelhamento Omnichannel para Plataforma de SAC

Núcleo de uma plataforma própria de atendimento: recebe tudo que acontece no
WhatsApp e no Instagram Direct — mensagem do cliente, resposta do atendente,
áudio, imagem, documento, foto de perfil, dado de grupo — normaliza num formato
único e espelha no banco da plataforma, em tempo real e nos dois sentidos.

- **Setor:** Produto / Infraestrutura de atendimento
- **Status:** Em produção, base de múltiplos clientes
- **Escala:** 186 nós, 2 canais, espelhamento bidirecional

---

## O problema

Plataforma de SAC própria depende de uma coisa antes de qualquer funcionalidade:
**o banco precisa refletir a conversa exatamente como ela aconteceu no WhatsApp.**

Se o espelho falha, tudo em cima desmorona. O atendente abre a conversa e falta a
última mensagem. O histórico mostra a resposta antes da pergunta. A mensagem que o
atendente mandou pelo celular não aparece na plataforma, e ele responde de novo.

Cinco dificuldades concretas:

**Duas plataformas, formatos incompatíveis.** WhatsApp e Instagram entregam
webhooks com estruturas completamente diferentes. Um usa `data.key.id`, o outro
`entry[0].messaging[0].message.mid`.

**Mensagem própria também conta.** Quando o atendente responde pelo celular, o
WhatsApp devolve isso como evento com `fromMe: true`. Ignorar significa histórico
com metade da conversa.

**Mídia não é texto.** Áudio, imagem, documento e vídeo chegam como referência —
precisam ser baixados, convertidos e persistidos antes de existirem na plataforma.

**Fragmentação.** Cliente manda cinco mensagens em dez segundos. Cada uma é um
webhook.

**Ordem e duplicidade.** Webhook reentrega. Rede atrasa. Sem controle de
idempotência, a conversa no banco fica diferente da conversa real.

---

## A solução

O fluxo funciona como camada de tradução entre os canais e o modelo de dados da
plataforma:

**Entrada normalizada.** Cada canal tem seu webhook e seu bloco de tratamento, que
extrai os mesmos campos de estruturas diferentes: instância, número, id da
mensagem, tipo, se é própria, nome de exibição, conteúdo.

**Roteamento por tipo.** Um switch separa texto, áudio, imagem, documento e vídeo.
Cada caminho tem seu processamento: áudio vai para transcrição, imagem para
descrição, PDF para extração de texto.

**Identidade resolvida na entrada.** Antes de gravar, o fluxo verifica se o
contato já existe. Se não, cadastra com foto de perfil e nome. Se sim, marca como
recorrente. Grupo tem tratamento próprio, com busca de metadados.

**Espelhamento nos dois sentidos.** Mensagem do cliente entra; resposta do
atendente ou do agente também é gravada. O banco fica com o diálogo completo.

**Saída pelos dois canais.** Envio via Evolution API para WhatsApp e via Graph API
para Instagram, com o mesmo formato interno.

---

## Arquitetura

```
   WhatsApp                          Instagram Direct
   (Evolution API)                   (Graph API)
        │                                  │
        ▼                                  ▼
   ┌──────────┐                      ┌──────────┐
   │ Webhook  │                      │ Webhook  │
   └────┬─────┘                      └────┬─────┘
        ▼                                 ▼
   ┌────────────────┐              ┌────────────────┐
   │  tratamento    │              │  tratamentos   │
   │  data.key.id   │              │  entry[0]...   │
   │  fromMe        │              │  sender.id     │
   │  messageType   │              │  message.mid   │
   └────────┬───────┘              └───────┬────────┘
            │                              │
            └──────────────┬───────────────┘
                           ▼
              ┌────────────────────────┐
              │  FORMATO ÚNICO         │
              │  instancia · numero ·  │
              │  idmessage · tipo ·    │
              │  propria? · conteúdo   │
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │  É MENSAGEM PRÓPRIA?   │  atendente respondeu
              │  fromMe → grava também │  pelo celular
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │  BLOQUEIO (Redis)      │  humano assumiu?
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │  BUFFER (Redis)        │  agrega fragmentos
              └───────────┬────────────┘
                          ▼
        ┌─────────────────────────────────────┐
        │   SWITCH POR TIPO DE MENSAGEM       │
        ├──────┬──────┬───────┬──────┬────────┤
        │ Texto│Áudio │Imagem │ PDF  │ Vídeo  │
        │      │  ↓   │   ↓   │  ↓   │        │
        │      │trans-│descri-│extra-│        │
        │      │crição│ ção   │ ção  │        │
        └──────┴───┬──┴───┬───┴──┬───┴────────┘
                   └──────┴──────┘
                          ▼
              ┌────────────────────────┐
              │  IDENTIDADE            │
              │  existe? → recorrente  │
              │  não     → cadastra    │
              │  grupo?  → metadados   │
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │  SUPABASE              │
              │  clientes              │
              │  mensagens_geral       │
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │  FILA (Redis) — 3      │
              │  AGENTE + memória      │
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │  DELAY HUMANIZADO      │
              │  proporcional ao texto │
              └───────────┬────────────┘
              ┌───────────┴────────────┐
              ▼                        ▼
       Evolution API            Instagram Graph
       (WhatsApp)                (Direct)

   [Error Trigger] ──► registra em n8n_errors + alerta
```

---

## Integrações

| Sistema | Uso |
|---|---|
| Evolution API | WhatsApp: receber, enviar, mídia, foto de perfil, grupos |
| Instagram Graph API | Direct: receber e enviar |
| Facebook Graph API | Metadados de perfil |
| Supabase | `clientes`, `mensagens_geral`, `n8n_errors` |
| Redis | Buffer, bloqueio humano e fila de atendimento |
| PostgreSQL | Memória de conversa do agente |
| OpenAI | Transcrição, visão e agente |

---

## Decisões técnicas

### Normalizar na entrada, não no consumo

Cada canal tem seu tradutor, e ambos produzem o mesmo objeto. Tudo depois disso —
switch de tipo, identidade, persistência, agente, envio — é agnóstico de canal.

A alternativa seria carregar a diferença adiante e tratar em cada ponto de
consumo. Isso multiplica condicionais por todo o fluxo e torna a inclusão de um
terceiro canal uma refatoração geral. Aqui, adicionar Telegram é escrever um
tradutor novo.

### Gravar mensagem própria

Quando o atendente responde pelo celular, o WhatsApp emite evento com marcação de
mensagem própria. O fluxo trata isso como conteúdo legítimo e grava.

É contraintuitivo — o reflexo é filtrar o próprio eco para evitar loop. Mas sem
isso a plataforma mostra só um lado da conversa, e o próximo atendente responde
algo que já foi respondido. O loop se evita no bloqueio e na verificação de
origem, não descartando o dado.

### Identidade resolvida antes da persistência

Antes de gravar mensagem, o fluxo resolve quem é o contato: busca, cadastra se
novo (com foto e nome de exibição), marca como recorrente se já existe.

Fazer isso depois criaria mensagem órfã em caso de falha no cadastro. A ordem
garante que toda mensagem no banco tem dono.

### Delay proporcional ao tamanho da resposta

O envio calcula o atraso a partir do comprimento do texto, com uma taxa de
caracteres por segundo, variação aleatória e piso e teto definidos. Mensagem curta
recebe tratamento especial para não cair sempre no mesmo valor.

O objetivo é ritmo plausível de digitação. Resposta longa que chega
instantaneamente denuncia automação; resposta curta que sempre demora exatamente
cinco segundos denuncia igual.

### Mídia convertida na entrada

Áudio, imagem, documento e vídeo são baixados, convertidos para base64 e
processados antes da persistência. Áudio vira transcrição, imagem vira descrição,
PDF vira texto.

A plataforma armazena conteúdo pesquisável, não referência a arquivo que pode
expirar no servidor do canal.

### Erros persistidos, não só alertados

O Error Trigger grava em tabela dedicada além de notificar. Alerta em WhatsApp se
perde na rolagem; tabela permite ver padrão — qual canal falha mais, qual tipo de
mídia quebra, em que horário.

Em componente de infraestrutura que sustenta vários clientes, isso é a diferença
entre corrigir a causa e apagar incêndio.

---

## Resultado

O que era integração pontual por cliente virou base reutilizável: os produtos de
atendimento construídos sobre esta camada herdam WhatsApp, Instagram, tratamento
de mídia, identidade e histórico sem reimplementar nada.

E o histórico na plataforma passou a refletir a conversa real, incluindo o que o
atendente respondeu pelo celular — que era a lacuna que fazia o time desconfiar do
sistema.

---

## Stack

`n8n` · `Evolution API` · `Instagram Graph API` · `Supabase` · `Redis` ·
`PostgreSQL` · `OpenAI`

---

## Rodando

**Credenciais necessárias:**

- [ ] Evolution API — instância de WhatsApp
- [ ] Instagram Graph API — token da conta comercial
- [ ] Supabase — URL e service role key
- [ ] Redis — buffer, bloqueio e fila
- [ ] PostgreSQL — memória do agente
- [ ] OpenAI — transcrição, visão e agente

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
INSTAGRAM_TOKEN
PLATAFORMA_BASE_URL
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Tokens de API, domínios, telefones,
> identificadores de grupo, e-mails e cerca de 285 identificadores internos foram
> substituídos por valores fictícios. Nenhum dado de cliente ou conversa
> acompanha este arquivo.
