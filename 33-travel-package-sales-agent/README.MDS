# Agente de Vendas e Cotação para Agência de Turismo

Assistente de atendimento em WhatsApp e Instagram para agência de viagens.
Recomenda destinos, envia o material visual de cada pacote, consulta informação
atualizada na internet quando necessário, e encaminha o lead qualificado ao grupo
de cotação com os dados de viagem já coletados.

- **Setor:** Turismo / Agência de viagens
- **Status:** Em produção
- **Escala:** 188 nós, dois canais de entrada, 4 destinos com galeria própria

---

## O problema

Agência de viagens vende por conversa, e a conversa é longa. Para cotar um
pacote o vendedor precisa de destino, datas, número de adultos e crianças, idade
das crianças, cidade de origem e faixa de orçamento.

Só que o cliente não chega assim. Ele chega com "quanto custa Maceió?" — e do
outro lado a resposta depende de sete variáveis que ninguém informou.

O que travava:

**O lead esfria na coleta.** Cada dado pedido é uma janela para o cliente sumir.
Turismo é compra por impulso e o impulso tem prazo de validade.

**Material visual é o que vende.** Cliente decide destino olhando foto de hotel e
praia, não lendo descrição. Mas mandar as fotos certas de cada pacote é trabalho
manual repetido dezenas de vezes por dia.

**Dois canais, uma equipe.** WhatsApp e Instagram Direct, ambos recebendo a mesma
pergunta, atendidos pelas mesmas pessoas.

**Fora do horário é quando mais chega.** Turismo se pesquisa à noite e no fim de
semana, exatamente quando a equipe de cotação não está.

---

## A solução

Um agente atende nos dois canais e conduz a conversa até o lead qualificado:

**Recomenda e mostra.** Para cada um dos quatro destinos principais existe um
sub-agente com galeria própria. Quando o cliente demonstra interesse, o agente
aciona o sub-agente do destino e as fotos são enviadas em sequência.

**Consulta a internet.** Uma ferramenta de busca dá ao agente acesso a informação
atualizada — evento na cidade, clima na época, atrativo específico — em vez de
responder só o que está no prompt.

**Coleta em ritmo de conversa.** Os dados de cotação são pedidos aos poucos, ao
longo do diálogo, e não como formulário.

**Encaminha qualificado.** Quando tem o suficiente, um sub-agente organiza os
dados e envia ao grupo de cotação, com o número do cliente já tratado.

**Assume o horário.** Fora do expediente o agente continua atendendo e registrando
a cotação, mas avisa que a equipe retorna no horário comercial.

---

## Arquitetura

```
   WhatsApp ─────┐
                 ├──► Webhooks de entrada
   Instagram ────┘
                 │
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
   │  áudio · imagem · PDF          │
   └──────────────┬─────────────────┘
                  ▼
   ┌───────────────────────────────────────────────┐
   │              AGENTE CONSULTOR                 │
   │           memória em PostgreSQL               │
   │                                               │
   │   FERRAMENTAS                                 │
   │   ┌─────────────────┐  ┌────────────────────┐ │
   │   │ internet (SERP) │  │ humanizado (Sheets)│ │
   │   │ info atualizada │  │ exemplos de tom    │ │
   │   └─────────────────┘  └────────────────────┘ │
   │   ┌─────────────────┐  ┌────────────────────┐ │
   │   │ cotacao         │  │ Think              │ │
   │   │ organiza e envia│  │                    │ │
   │   └─────────────────┘  └────────────────────┘ │
   │                                               │
   │   GALERIAS POR DESTINO                        │
   │   ┌────────┐ ┌───────────┐ ┌──────┐ ┌───────┐ │
   │   │ Maceió │ │  Porto de │ │ For- │ │ Natal │ │
   │   │        │ │  Galinhas │ │taleza│ │       │ │
   │   └────────┘ └───────────┘ └──────┘ └───────┘ │
   │   cada um: sub-agente + webhook + envio       │
   └───────────────────────┬───────────────────────┘
                           ▼
              ┌────────────────────────┐
              │  Grupo de cotação      │
              │  dados + nº do cliente │
              └────────────────────────┘

   ROTINA AGENDADA
   └── Limpeza da planilha de controle

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp (Evolution API) | Canal principal, mídia, presença |
| Instagram Graph API | Segundo canal de entrada |
| SerpAPI | Busca de informação atualizada sobre destinos |
| Google Sheets | Controle de cotações e exemplos de tom de conversa |
| Redis | Bloqueio humano e buffer de mensagens |
| PostgreSQL | Memória do agente e de cada sub-agente de destino |
| Supabase | Registro de atendimentos |
| OpenAI | Agentes, transcrição, visão e leitura de PDF |

---

## Decisões técnicas

### Um sub-agente por destino, com galeria própria

Cada destino tem sub-agente, webhook e sequência de envio de fotos próprios. A
alternativa seria um único fluxo de envio parametrizado pelo destino.

A escolha por separar tem um motivo prático: a galeria de cada destino muda em
ritmo próprio, conforme o hotel parceiro e a época. Com fluxo separado, trocar as
fotos de Maceió não toca em nada de Fortaleza. Com fluxo parametrizado, qualquer
ajuste mexe no caminho de todos.

O custo é duplicação — quatro caminhos quase iguais. É uma troca consciente de
elegância por isolamento, e em operação comercial que muda material toda
temporada, o isolamento vale mais.

### Busca na internet como ferramenta

O agente tem acesso a busca em tempo real. Isso o tira da limitação de responder
só o que foi escrito no prompt: pergunta sobre evento na cidade, clima na época
ou atrativo específico é respondida com informação atual.

Em turismo isso importa porque o repertório de perguntas é praticamente
ilimitado, e um prompt nunca vai cobrir tudo.

### Planilha como referência de tom

Uma ferramenta de Google Sheets guarda exemplos de conversa que o agente consulta
para calibrar a linguagem.

Isso resolve um problema real de prompt: descrever tom de voz em texto
("descontraída, acolhedora") é vago e o modelo interpreta de formas diferentes.
Exemplo concreto é instrução mais precisa que adjetivo — e a equipe comercial
pode ajustar o tom editando a planilha, sem tocar no prompt.

### Dois canais, um agente

WhatsApp e Instagram entram por webhooks distintos e convergem para o mesmo
agente, com normalização na entrada.

Manter dois agentes exigiria replicar toda a lógica de venda e a base de destinos.
Aqui o canal é detalhe de transporte, não de negócio.

### Coletar aos poucos, encaminhar quando suficiente

A checklist de cotação existe, mas o agente não a executa como formulário — vai
pedindo ao longo da conversa. O sub-agente de cotação valida o que tem antes de
encaminhar e exige o nome do cliente.

Em venda por impulso, cada pergunta é uma chance de perder o lead. Diluir a
coleta na conversa é o que mantém o cliente até o fim.

### Número tratado, não pedido

O número do cliente é extraído do contexto e limpo (remove sufixo do WhatsApp e
código do país) antes de ir ao grupo de cotação. O agente não pergunta.

### Atender fora do horário, avisando

O agente segue atendendo e registrando cotação fora do expediente, mas deixa
explícito que o retorno virá no horário comercial.

Turismo se pesquisa à noite. Deixar o lead sem resposta até segunda é perder para
quem respondeu; prometer retorno imediato que não vem é pior ainda.

---

## Resultado

O lead passou a chegar ao grupo de cotação já qualificado, com destino, datas,
número de passageiros e origem — e a agência passou a responder nos dois canais
fora do horário comercial, que é quando a maior parte da pesquisa de viagem
acontece.

O envio do material visual de cada destino, que era trabalho manual repetido,
passou a ser acionado pelo próprio agente no momento em que o cliente demonstra
interesse.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `SerpAPI` · `Redis` · `PostgreSQL` ·
`Supabase` · `Evolution API (WhatsApp)` · `Instagram Graph API` ·
`Google Sheets API`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com transcrição e visão
- [ ] Evolution API — instância de WhatsApp
- [ ] Instagram Graph API — token da conta comercial
- [ ] SerpAPI — busca na internet
- [ ] Google Sheets — controle e referência de tom
- [ ] Redis — bloqueio e buffer
- [ ] PostgreSQL — memória dos agentes
- [ ] Supabase — registro de atendimentos

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
INSTAGRAM_TOKEN
SERPAPI_KEY
SHEET_ID_COTACOES
GRUPO_COTACAO
FOTO_DESTINO_BASE64     # imagens de cada galeria
```

> As fotos dos destinos estavam embutidas em base64 no workflow original
> (aproximadamente 5 MB). Foram substituídas por referência a variável de
> ambiente — ver nota de arquitetura abaixo.

**Importar:** `Workflows → Import from File → workflow.json`

---

## Nota: mídia embutida no workflow

O workflow original carregava vinte imagens em base64 dentro dos próprios nós,
somando cerca de 5 MB — 96% do tamanho do arquivo.

Funciona, mas tem custo: o workflow fica pesado para abrir e editar, cada
alteração de foto exige mexer no fluxo, e o versionamento carrega binário.

O caminho melhor é hospedar as imagens e referenciar por URL, mantendo no
workflow apenas o endereço. Registro aqui como dívida técnica conhecida, não como
recomendação de replicar.

---

> Workflow sanitizado para publicação. Nome da agência, CNPJ, endereço,
> telefones, redes sociais, nomes de vendedores, credenciais e IDs de planilha
> foram substituídos por valores fictícios. As imagens dos destinos foram
> removidas. Nenhum dado de cliente acompanha este arquivo.
