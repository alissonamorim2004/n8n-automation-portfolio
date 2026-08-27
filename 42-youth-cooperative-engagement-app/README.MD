# CoopJovem — App de Engajamento de Jovens no Cooperativismo

Aplicativo mobile que aproxima o público jovem do cooperativismo por um caminho
que ele já conhece: feed de vídeo curto, missões diárias, pontuação, ranking
semanal e troca de pontos por benefícios reais da cooperativa.

- **Contexto:** Hackathon de inovação — 4º lugar
- **Desafio:** como trazer os jovens para o cooperativismo
- **Escala:** ~5.600 linhas de TypeScript, React Native + Expo Router

---

## O desafio

Cooperativa de crédito tem um problema demográfico conhecido: **o associado
médio envelhece e o jovem não entra.**

E a razão não é falta de oferta. É que o cooperativismo se apresenta pelo lado
errado para esse público. Assembleia, cota-parte, ata, participação na gestão —
vocabulário institucional, canal formal, benefício que só aparece no longo prazo.
Nada disso compete com a atenção de quem tem dezoito anos.

As tentativas usuais falham de forma previsível:

**Conteúdo educativo institucional.** Cartilha sobre os princípios do
cooperativismo tem taxa de leitura próxima de zero nessa faixa etária.

**Benefício financeiro isolado.** Taxa melhor não diferencia — banco digital
oferece o mesmo, com app melhor.

**Comunicação por canal que o jovem não usa.** E-mail e mural de agência.

A pergunta que orientou o projeto foi outra: **em vez de trazer o jovem para o
formato do cooperativismo, como levar o cooperativismo para o formato que o jovem
já usa?**

---

## A proposta

Um app construído sobre os mecanismos que já prendem atenção nessa faixa etária,
com o conteúdo e a recompensa vindos da cooperativa.

**Feed de vídeo curto.** A porta de entrada é conteúdo em formato vertical, curto,
por criador — não cartilha em PDF. Educação financeira e cooperativismo entram
como assunto, não como aula.

**O jovem também publica.** Câmera integrada: o usuário produz conteúdo, ganha
pontos e aparece no feed. Isso inverte a relação — ele deixa de ser público e vira
participante, que é justamente o princípio do cooperativismo traduzido para a
linguagem do app.

**Missões diárias e semanais.** Objetivos curtos com progresso visível: assistir,
publicar, completar módulo educativo. Retorno imediato em vez de benefício
abstrato no fim do ano.

**Ranking semanal.** Competição com reinício periódico, para que quem entra depois
ainda tenha chance de aparecer.

**Carteira de pontos com extrato.** Cada ganho e cada gasto ficam registrados, com
motivo. O jovem vê o saldo crescer.

**Recompensas reais, não brindes.** Os pontos são trocados por três categorias:
condições de crédito, benefícios educacionais e acesso a eventos. É aqui que o
ciclo fecha — o engajamento no app vira relacionamento com a cooperativa.

**Assistente de dúvidas.** Chat para as perguntas que o jovem tem vergonha de
fazer na agência.

---

## Telas

```
   ┌──────────────────────────────────────────┐
   │  Login                                   │
   └───────────────────┬──────────────────────┘
                       ▼
   ┌──────────────────────────────────────────┐
   │  Feed        vídeos e fotos, curtir      │
   ├──────────────────────────────────────────┤
   │  Câmera      publicar conteúdo próprio   │
   ├──────────────────────────────────────────┤
   │  Missões     diárias e semanais          │
   ├──────────────────────────────────────────┤
   │  Educação    trilha de conteúdo          │
   ├──────────────────────────────────────────┤
   │  Ranking     posição semanal             │
   ├──────────────────────────────────────────┤
   │  Recompensas crédito · educação · eventos│
   ├──────────────────────────────────────────┤
   │  Perfil      histórico e conquistas      │
   └──────────────────────────────────────────┘
        │                          │
        ▼                          ▼
   ┌──────────┐            ┌──────────────┐
   │ Carteira │            │ Chat/dúvidas │
   │ extrato  │            │              │
   └──────────┘            └──────────────┘
```

---

## Modelo de dados

```typescript
User             // perfil, região, interesses, pontos total e semanal
Video            // conteúdo, autor, tags, categoria, métricas
Mission          // tipo diário|semanal, meta, progresso, pontos
Reward           // custo, categoria crédito|educação|eventos
PointTransaction // ganho|gasto, motivo, origem, timestamp
UserRedemption   // resgate com status pendente|aprovado|entregue
ChatMessage      // histórico do assistente
```

Duas escolhas que valem apontar:

**`PointTransaction` como extrato, não como saldo.** O saldo é derivado das
transações, cada uma com motivo e origem. Em app de pontos, o usuário
inevitavelmente questiona "por que meu saldo mudou?" — e sem extrato, não há
resposta. É o mesmo princípio de carteira usado no
[marketplace de delivery](../../tabarato) deste portfólio.

**`UserRedemption` com status de três estágios.** Resgate não é instantâneo:
benefício de crédito passa por aprovação, evento tem confirmação. Modelar
pendente → aprovado → entregue evita a promessa de entrega imediata que a
operação não consegue cumprir.

---

## Stack

`React Native` · `Expo` · `Expo Router` · `TypeScript` · `Context API` ·
`AsyncStorage` · `expo-camera` · `expo-haptics` · `expo-linear-gradient` ·
`lucide-react-native`

Navegação por arquivo com Expo Router, estado global em Context, persistência
local em AsyncStorage.

---

## Decisões técnicas

### Formato antes de conteúdo

A decisão central do projeto não é técnica. É reconhecer que o obstáculo não era
falta de informação sobre cooperativismo, e sim o formato em que ela era
oferecida.

Todo o resto — feed, missões, ranking — decorre disso. Se a premissa estivesse
errada, nenhuma implementação salvaria o produto.

### O usuário publica, não só consome

Câmera integrada com pontuação por publicação. Essa é a ponte conceitual entre o
app e o cooperativismo: cooperativa é organização em que o associado participa da
gestão, não apenas consome serviço. Um app em que o jovem só assiste reproduz a
relação de banco tradicional.

### Recompensa dentro do negócio, não fora

As três categorias de recompensa são condições de crédito, benefícios educacionais
e eventos — tudo que a cooperativa já oferece.

A alternativa fácil seria sortear brinde ou dar cashback. Isso custa dinheiro e
não gera relacionamento: o jovem resgata e sai. Recompensa que é produto da
cooperativa transforma engajamento em vínculo.

### Ranking semanal, não acumulado

Ranking que nunca zera é dominado por quem entrou primeiro, e desestimula quem
chega depois. O corte semanal mantém a competição aberta.

### Retorno imediato em cada ação

Feedback tátil e animação de pontos a cada ganho. Em produto de engajamento, o
intervalo entre a ação e a recompensa percebida determina se o hábito se forma. O
cooperativismo tradicional erra exatamente aqui: o benefício existe, mas aparece
tarde demais para criar hábito.

---

## Estado do projeto

Protótipo de hackathon, com dados simulados e persistência local. Não tem backend,
autenticação real nem integração com sistemas da cooperativa.

O que existe é a arquitetura de telas, o modelo de dados e a mecânica de
engajamento completa e navegável — que era o objetivo dentro do prazo da
competição.

**Para virar produto, faltaria:** backend com autenticação e persistência,
upload e moderação de conteúdo, integração com o cadastro de associados da
cooperativa, esteira de aprovação de resgate, e proteção contra fraude na
pontuação — que em sistema de pontos com valor real é requisito, não melhoria.

---

## Rodando

```bash
cd app-src
npm install
npm run dev
```

Abre no Expo Go pelo QR code, ou `npm run build:web` para a versão web.

---

## Resultado

4º lugar na competição.

O que sustentou a colocação, na minha leitura, não foi a execução técnica — foi a
inversão da pergunta. Os projetos que competem nesse tipo de desafio tendem a
propor formas melhores de explicar cooperativismo. Este propôs traduzir o
cooperativismo para um formato que dispensa explicação.

---

> Protótipo de hackathon. Os dados de usuário, vídeo e recompensa são simulados;
> nenhum dado real de associado ou de cooperativa está incluído.
