# Curadoria Automatizada de Conteúdo Científico

Ferramenta web onde o médico digita uma especialidade e recebe, já classificados,
os artigos e novidades científicas mais relevantes daquela área — com resumo em
linguagem acessível e indicação de quais podem virar conteúdo para o paciente.
Tudo gravado na planilha da equipe de marketing.

- **Setor:** Saúde / Marketing médico
- **Status:** Em produção
- **Escala:** 16 nós, dois modos de disparo (semanal e sob demanda)

---

## O problema

Clínica que produz conteúdo para o paciente enfrenta um gargalo específico: **quem
sabe avaliar o artigo é o médico, e o médico não tem tempo.**

O ciclo antes era este: a agência precisava de pauta, pedia ao médico; o médico
abria PubMed e sites de sociedade, lia meia dúzia de resumos, escolhia dois e
explicava por WhatsApp por que aqueles importavam. Ou — o que acontecia com mais
frequência — não fazia, e a agência publicava conteúdo genérico.

Três problemas embutidos:

**O filtro certo não é "é um bom artigo".** É "isso interessa ao paciente e pode
virar post". Estudo excelente de metodologia pode ser tecnicamente denso demais
para servir. Notícia mediana sobre mudança de protocolo pode ser exatamente o que
o paciente precisa saber.

**Tradução de registro.** Artigo científico é escrito para pares. Vira conteúdo de
Instagram só depois de alguém reescrever pensando em benefício para o paciente.

**Não fica registrado.** O que foi avaliado e descartado se perde, e três meses
depois o mesmo artigo é reavaliado do zero.

---

## A solução

O médico acessa uma página, digita a especialidade e dispara. O fluxo:

1. **Busca** com profundidade avançada em fontes científicas, excluindo redes
   sociais e agregadores de imagem
2. **Separa** os resultados e normaliza os campos de cada artigo
3. **Classifica** cada um individualmente com um modelo, que devolve JSON
   estruturado: título traduzido, resumo em linguagem acessível, nível de
   relevância, motivo da relevância, tipo de conteúdo e se serve como post
4. **Filtra** o que veio como baixa relevância
5. **Grava** na planilha da equipe, com data, fonte e URL
6. **Devolve** um resumo da execução na própria página

Além do disparo sob demanda, um agendador roda semanalmente para manter a
planilha alimentada sem ninguém pedir.

---

## Arquitetura

```
   Médico (página web)                    Agendador semanal
        │  especialidade                        │
        └──────────────┬────────────────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Configurações          │  especialidade, quantidade,
          │  parâmetros da execução │  idioma, planilha destino
          └────────────┬────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Busca científica       │  profundidade avançada
          │  (Tavily)               │  exclui redes sociais
          └────────────┬────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Separar artigos        │  1 item por artigo
          └────────────┬────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Preparar campos        │  normaliza título, url,
          │                         │  fonte, snippet, data
          └────────────┬────────────┘
                       ▼
          ┌─────────────────────────────────────┐
          │  CLASSIFICAÇÃO POR ARTIGO           │
          │  temperatura baixa, saída JSON      │
          │                                     │
          │  → titulo_pt                        │
          │  → resumo (2-3 frases, acessível)   │
          │  → relevancia: alta|media|baixa     │
          │  → motivo_relevancia                │
          │  → tipo: pesquisa|notícia|guideline │
          │          |caso clínico|opinião      │
          │  → usar_como_post: true|false       │
          └────────────┬────────────────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Parsear resposta       │  tolerante a markdown
          └────────────┬────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Filtrar baixa relevância│
          └────────────┬────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Google Sheets          │
          │  planilha da equipe     │
          └────────────┬────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Agregar + resumo       │  devolvido à página
          └─────────────────────────┘
```

---

## Integrações

| Sistema | Uso |
|---|---|
| Tavily | Busca com profundidade avançada em fontes científicas |
| OpenAI | Classificação, tradução e resumo |
| Google Sheets | Planilha de curadoria da equipe |
| Webhook | Página web do médico, com resposta síncrona |

---

## Decisões técnicas

### Critério de relevância é editorial, não acadêmico

Os três níveis não medem qualidade científica — medem utilidade para
comunicação com paciente:

- **Alta** — novidade clínica, novo tratamento, mudança de protocolo
- **Média** — informação útil, conteúdo educativo, sem urgência
- **Baixa** — técnico demais para paciente, ou genérico demais

Essa inversão é o ponto do projeto. Um classificador treinado para achar "bons
artigos" traria revisão sistemática densa e descartaria a notícia sobre mudança
de conduta — que é justamente o que vira post útil.

### Um artigo por chamada, não a lista inteira

Os resultados são separados e cada artigo passa pelo modelo individualmente.

Mandar dez de uma vez seria mais barato, mas a qualidade cai: o modelo compara os
artigos entre si em vez de avaliar cada um pelo critério, e tende a distribuir
notas por posição relativa. Um por vez mantém o critério absoluto.

### Saída JSON com parser tolerante

O prompt exige JSON puro, sem markdown, sem bloco de código. E o nó seguinte
mesmo assim limpa cercas de código antes de parsear.

Instrução de formato não é garantia. Modelo devolve JSON dentro de bloco de código
com frequência suficiente para quebrar o fluxo em produção, e o parser defensivo é
mais barato que investigar execução falha uma semana depois.

### Temperatura baixa na classificação

O modelo roda com temperatura reduzida e limite de tokens curto. Não se quer
criatividade aqui — se quer que o mesmo artigo receba a mesma classificação em
execuções diferentes. Curadoria que muda de opinião a cada rodada não é curadoria.

### Filtro antes da planilha, não depois

O descarte por baixa relevância acontece antes da gravação. A planilha é o que a
equipe de marketing lê, e planilha com ruído é planilha que ninguém abre.

### Dois modos de disparo, um pipeline

Agendador semanal e webhook sob demanda entram no mesmo fluxo. O primeiro mantém a
base alimentada; o segundo atende a demanda pontual do médico que quer pesquisar
um tema específico.

Um pipeline só significa que qualquer ajuste no critério de classificação vale
para os dois caminhos automaticamente.

---

## Resultado

A curadoria deixou de depender do médico abrir portal científico e ler resumo. Ele
digita a especialidade e recebe a lista já triada, traduzida e justificada.

Para a agência, a planilha passou a ser a fonte de pauta — com o motivo da
relevância registrado, que é o contexto que antes se perdia no WhatsApp.

---

## Stack

`n8n` · `OpenAI` · `Tavily` · `Google Sheets API`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API
- [ ] Tavily — chave de busca
- [ ] Google Sheets — planilha de destino

**Variáveis de ambiente:**

```
TAVILY_API_KEY
SHEET_ID_CURADORIA
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Chave da API de busca, ID de planilha,
> nome do cliente e endpoints foram substituídos por valores fictícios.
