# PortalEdu — Alocação de Vagas Escolares por Proximidade

Plataforma municipal de matrícula em creche e educação infantil que substitui a
fila por ordem de chegada por alocação baseada em distância casa-escola, com
critérios sociais de prioridade e acompanhamento público do processo.

- **Contexto:** Hackathon de inovação urbana — desafio: resolver um problema real do município
- **Escala:** ~5.700 linhas de TypeScript, React + Vite, 10 telas, 3 perfis de acesso

---

## O problema

Vaga em creche municipal é um dos poucos serviços públicos onde a demanda supera a
oferta de forma estrutural e permanente. E o processo tradicional de distribuição
falha em três frentes ao mesmo tempo.

**Fila por ordem de chegada premia quem pode esperar.** Mãe que trabalha não
dorme na porta da secretaria. Quem consegue chegar às cinco da manhã é justamente
quem tem alguém disponível para ir — o oposto de quem mais precisa da vaga.

**A alocação ignora a geografia.** Criança do bairro A recebe vaga na escola do
bairro D, do outro lado da cidade, enquanto uma vaga fica ociosa na escola a três
quadras da casa dela. Isso gera dois danos: transporte que a família não tem, e
evasão quando o deslocamento se torna inviável.

**O processo é opaco.** O responsável entrega o formulário e não sabe mais nada.
Não sabe a posição, não sabe o critério, não sabe quando terá resposta. A opacidade
alimenta a percepção — às vezes correta — de que a vaga saiu por indicação.

Do lado da secretaria, o problema espelha: nenhuma visão consolidada de onde está
a demanda reprimida, o que impede planejar onde abrir turma nova.

---

## A proposta

Três perfis, um processo transparente do início ao fim.

### Responsável (cidadão)

- **Inscrição online** com dados do aluno, endereço, bairro e nível pretendido
- **Mapa de proximidade** mostrando as escolas próximas antes de escolher
- **Marcação de critérios sociais** — programa de transferência de renda,
  necessidade especial
- **Acompanhamento do status** em tempo real, com o critério aplicado visível
- **Notificação** por WhatsApp, SMS e e-mail a cada mudança
- **Assistente de dúvidas** sobre documentação e etapas

### Escola

- Painel das candidaturas recebidas
- Vagas por nível e turma
- Confirmação de matrícula

### Secretaria de Educação

- Visão consolidada da rede
- Mapa de calor da demanda por bairro
- Indicadores por escola e por nível
- Campanhas e comunicação para a rede

---

## Arquitetura de telas

```
                    ┌──────────────────┐
                    │   Landing Page   │
                    └────────┬─────────┘
                             ▼
                  ┌────────────────────┐
                  │  Login / Cadastro  │
                  │  cidadão · escola  │
                  │  · secretaria      │
                  └─────────┬──────────┘
                            ▼
                  ┌────────────────────┐
                  │   Rota protegida   │
                  │   por perfil       │
                  └─────────┬──────────┘
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  ┌───────────┐      ┌────────────┐     ┌──────────────┐
  │  CIDADÃO  │      │   ESCOLA   │     │  SECRETARIA  │
  ├───────────┤      ├────────────┤     ├──────────────┤
  │ Portal    │      │ Dashboard  │     │ Dashboard    │
  │ Inscrição │      │ candidatu- │     │ mapa de calor│
  │ Status    │      │ ras, vagas │     │ indicadores  │
  │ Mapa      │      │ confirma-  │     │ campanhas    │
  │ Blog      │      │ ção        │     │              │
  └─────┬─────┘      └────────────┘     └──────────────┘
        │
        ▼
  ┌──────────────────────────────────┐
  │  ProximityMap                    │
  │  escolas + bairro do usuário     │
  │  visualização de proximidade     │
  └──────────────────────────────────┘

  ChatBot — assistente de dúvidas, disponível no fluxo do cidadão
```

---

## Stack

`React` · `TypeScript` · `Vite` · `React Router` · `Tailwind CSS` ·
`Google Maps API` · `Leaflet / React-Leaflet` · `Recharts` · `date-fns` ·
`lucide-react`

Controle de acesso por perfil com rota protegida e contexto de autenticação.

---

## Decisões de produto

### Distância como critério, não ordem de chegada

A inversão central. Ordem de chegada não é neutra — ela distribui vaga por
disponibilidade de tempo, que correlaciona com quem menos precisa. Distância
casa-escola é um critério objetivo, verificável e alinhado ao interesse da
criança.

Também resolve o problema operacional: alocar por proximidade reduz evasão por
transporte e distribui melhor a ocupação da rede.

### Critérios sociais explícitos, não discricionários

Programa de transferência de renda e necessidade especial entram como campo do
formulário, com peso declarado no processo.

A diferença em relação ao modelo atual é que a prioridade deixa de depender de
alguém "olhar o caso com carinho". Critério escrito e aplicado igualmente é o que
separa política pública de favor.

### Status visível com o critério à mostra

O responsável vê em que etapa está e por qual critério foi classificado.

Transparência aqui não é conveniência — é o que permite contestar. Processo em que
o cidadão não sabe o critério é processo que ele não pode questionar, e a
percepção de apadrinhamento se sustenta justamente na falta de informação.

### Mapa de calor da demanda para a gestão

A secretaria enxerga onde a demanda reprimida se concentra por bairro.

Esse é o dado que o processo em papel destrói: cada formulário é um registro
isolado, e ninguém consolida. Com ele, a decisão de onde abrir turma nova deixa de
ser política e passa a ser informada.

### Notificação por WhatsApp, não só e-mail

O público-alvo de creche municipal usa WhatsApp. Comunicação por e-mail ou edital
no mural exclui exatamente quem o serviço deveria atender.

### Mapa antes da escolha

O responsável vê as escolas próximas antes de indicar preferência. Escolher no
escuro produz preferência irrealista e frustração quando o resultado sai
diferente.

---

## Estado do projeto

Protótipo de hackathon: dados simulados, autenticação de demonstração, sem
backend.

O que está implementado é a jornada completa e navegável dos três perfis, a
visualização geográfica com coordenadas reais dos bairros do município, e os
painéis de gestão com dados de exemplo.

**Para virar sistema municipal, faltaria:** backend com persistência e auditoria,
integração com o cadastro social do município para validar critérios de
prioridade, o algoritmo de alocação de fato implementado com regras de desempate,
assinatura e trilha de auditoria de cada decisão, e conformidade com a LGPD para
dado de criança — que é a categoria mais sensível da lei.

---

## Rodando

```bash
cd app-src
cp .env.example .env    # preencher a chave do Google Maps
npm install
npm run dev
```

---

## Nota sobre o que isso é

Este é um protótipo de competição, não um sistema em produção. O valor dele está
na proposta: mostrar que a distribuição de vaga escolar pode ser feita por
critério objetivo e auditável, com a informação exposta a quem depende dela.

A parte difícil de um sistema assim não é a técnica — é a decisão de tornar o
critério público. É isso que o protótipo defende.

---

> Protótipo de hackathon. Dados de aluno, responsável, escola e candidatura são
> simulados. A chave da API de mapas foi removida; configure a sua em `.env`.
> Nenhum dado real de cidadão ou da administração municipal está incluído.
