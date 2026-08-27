# Agente Multilíngue para Estúdio de Treinamento nos EUA

Assistente de atendimento em WhatsApp para estúdio de personal training nos
Estados Unidos, com clientela mista de falantes de inglês, português e espanhol.
Detecta o idioma na primeira mensagem e conduz toda a conversa nele, informando
horários, modalidades e valores.

- **Setor:** Fitness / Personal training
- **País:** Estados Unidos
- **Escala:** 51 nós — o mais enxuto dos agentes deste portfólio

---

## O problema

Estúdio de treinamento nos EUA com clientela latina tem um problema que não
aparece em nenhum dos outros projetos deste portfólio: **três idiomas no mesmo
número de WhatsApp.**

O cliente estadunidense escreve em inglês. O brasileiro escreve em português. O
hispano-falante escreve em espanhol. E todos chegam pelo mesmo canal, perguntando
a mesma coisa: horário, modalidade e preço.

As saídas usuais falham:

**Atender só em inglês** exclui parte relevante da base — e num estúdio pequeno,
essa parte é justamente a que chega por indicação da comunidade.

**Manter números separados por idioma** significa dividir a operação e confundir
quem indica.

**Responder no idioma errado** é pior que demorar: o cliente entende que não é
bem-vindo ali.

E há o problema comum a todo estúdio pequeno: quem responde o WhatsApp é o mesmo
profissional que está dando aula. Mensagem chega durante o treino ou depois das
nove da noite, e a resposta sai no dia seguinte — quando o interessado já
procurou outro lugar.

---

## A solução

Um agente único que resolve os três idiomas sem multiplicar a estrutura:

**Detecção na primeira mensagem.** O idioma é identificado no primeiro contato e
mantido até o fim da conversa. Não há troca no meio, não há pergunta "prefere
inglês ou português?".

**Um agente, não três.** A base de conhecimento — horários, modalidades, valores
— é uma só. O idioma é camada de apresentação, não de conteúdo.

**Coleta em ritmo humano.** Nome pedido logo após a apresentação, uma pergunta por
mensagem, com instrução explícita para não repetir pergunta já feita.

**Áudio e imagem tratados.** Cliente que manda áudio em espanhol tem a mensagem
transcrita antes de chegar ao agente.

**Fuso horário do estúdio.** A saudação e a referência de data usam o horário
local, não o do servidor.

---

## Arquitetura

```
   Cliente (WhatsApp) — EN · PT · ES
        │
        ▼
   ┌────────────────────────────────┐
   │  Filtros: LID? mensagem própria│
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BLOQUEIO HUMANO (Redis)       │
   │  cria e verifica chave         │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  BUFFER DE MENSAGENS (Redis)   │
   │  acumula → espera → concatena  │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  SWITCH POR TIPO               │
   ├──────────┬──────────┬──────────┤
   │  Texto   │  Áudio   │  Imagem  │
   │          │    ↓     │    ↓     │
   │          │transcri- │ descri-  │
   │          │  ção     │  ção     │
   └──────────┴────┬─────┴──────────┘
                   ▼
   ┌────────────────────────────────────────┐
   │            AGENTE                      │
   │      memória em PostgreSQL             │
   │                                        │
   │  Detecta idioma na 1ª mensagem         │
   │  e mantém até o fim                    │
   │                                        │
   │  Base única: horários · modalidades    │
   │  · valores · fixo vs. flexível         │
   │                                        │
   │  ┌──────────┐                          │
   │  │  Think   │                          │
   │  └──────────┘                          │
   └───────────────────┬────────────────────┘
                       ▼
   ┌────────────────────────────────┐
   │  Envio + marcação de lida      │
   └────────────────────────────────┘

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp (Evolution API) | Canal, mídia, marcação de lida |
| Redis | Bloqueio humano e buffer de mensagens |
| PostgreSQL | Memória de conversa |
| OpenAI | Agente, transcrição de áudio e visão |

---

## Decisões técnicas

### Detectar e travar o idioma, não alternar

O idioma é definido na primeira mensagem e mantido pelo resto da conversa.

A alternativa — detectar a cada mensagem — parece mais flexível e é pior na
prática: cliente bilíngue que solta uma palavra em inglês no meio de uma frase em
português faz o agente virar a chave, e a conversa fica inconsistente. Travar na
primeira mensagem é mais previsível.

### Um agente, não um por idioma

A base de horários, modalidades e valores é única, e o idioma é camada de saída.

Manter três agentes significaria manter três cópias da mesma informação, e
qualquer mudança de preço precisaria ser replicada — com risco de divergência
entre idiomas, que é o tipo de erro que só aparece quando um cliente reclama.

### Fuso horário do estúdio, não do servidor

Saudação e data usam o fuso local do estúdio. Parece detalhe, mas "bom dia" às
onze da noite denuncia automação na primeira mensagem — e num agente que se
apresenta como pessoa, esse é o ponto mais frágil.

### Uma pergunta por mensagem, sem repetir

Duas instruções combinadas: uma pergunta por vez, e verificação explícita contra
repetição.

A segunda existe porque agente com memória longa frequentemente repergunta o que
já foi respondido, e em conversa de venda isso comunica desatenção.

### Escopo estreito de propósito

Este fluxo faz atendimento informativo — horário, modalidade, valor — e para aí.
Sem agendamento, sem integração com sistema de gestão, sem pagamento.

São 51 nós, contra 291 do projeto mais complexo do portfólio. É a demonstração de
que a arquitetura de atendimento — bloqueio, buffer, mídia, memória — escala para
baixo: o mesmo padrão serve o estúdio de uma pessoa e a clínica de 27 médicos, com
a diferença estando no que se pluga em cima.

---

## Ponto em aberto: divulgação da natureza do agente

O prompt instrui o agente a nunca revelar que é uma IA, mesmo se perguntado
diretamente.

Registro como decisão do cliente, e não como recomendação. Vale a mesma
observação que fiz no [agente de oftalmologia](../11-ophthalmology-triage-agent):
a abordagem que eu defendo é assumir a condição quando perguntado, mantendo o tom
acolhedor — implementada no
[agente jurídico](../20-legal-intake-agent) deste portfólio.

Aqui o risco é menor que em contexto clínico, mas o argumento é o mesmo: a
confiança perdida quando o cliente descobre depois custa mais que a naturalidade
ganha.

---

## Resultado

O estúdio passou a responder nos três idiomas, a qualquer hora, sem que o
profissional precisasse interromper aula para informar horário e preço.

E a clientela que chega por indicação da comunidade latina passou a ser atendida
no próprio idioma — que, num negócio local de indicação boca a boca, é o que
determina se a indicação vira cliente.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `Redis` · `PostgreSQL` ·
`Evolution API (WhatsApp)`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com transcrição e visão
- [ ] Evolution API — instância de WhatsApp
- [ ] Redis — bloqueio e buffer
- [ ] PostgreSQL — memória de conversa

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
TIMEZONE            # fuso do estúdio
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Nome do estúdio, domínio, redes sociais,
> identificadores de grupo, credenciais e identificadores internos foram
> substituídos por valores fictícios. Nenhum dado de cliente acompanha este
> arquivo.
