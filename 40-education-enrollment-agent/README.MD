# Agente de Atendimento e Captação para Instituição de Ensino

Assistente de atendimento em WhatsApp para instituição que abrange desde
educação infantil até ensino superior. Responde dúvidas sobre cursos, valores e
condições consultando a base institucional, e encaminha para Comercial,
Financeiro ou Secretaria conforme a natureza do contato.

- **Setor:** Educação
- **Status:** Em produção
- **Escala:** 97 nós, base de conhecimento em duas ferramentas, roteamento para 3 setores

---

## O problema

Instituição que atende do maternal ao ensino superior recebe, no mesmo WhatsApp,
públicos completamente diferentes:

Um pai perguntando sobre a vaga do maternal. Um vestibulando querendo saber a
grade de Administração. Um aluno matriculado pedindo segunda via de boleto. Outro
pedindo histórico escolar para transferência.

Cada um desses vai para um setor diferente, e nenhum deles sabe disso.

O que travava antes:

**Pergunta de preço virava transferência.** O contato mais comum — "quanto custa?"
— era encaminhado ao Comercial, que respondia um número que estava numa tabela.
Fila cheia de pergunta que não precisava de pessoa.

**Reclamação de preço ia para o lugar errado.** Quem reclama do valor não quer
saber o valor de novo, quer negociar. Isso é Financeiro, mas caía no Comercial.

**Volume concentrado na captação.** Em período de matrícula, o mesmo time que
fecha matrícula é o que responde dúvida de grade curricular.

---

## A solução

Um agente atende e trabalha sobre duas bases:

**Base de cursos e institucional.** Grade dos cursos de graduação, duração,
modalidade, níveis de ensino da escola, diferenciais, endereço, horários. O
agente responde direto a partir dela — inclusive valores.

**Base de setores e condições.** Contém as regras de encaminhamento e os contatos
de cada setor, com horário de funcionamento próprio.

O roteamento tem uma regra que inverte o padrão dos outros fluxos: **o agente não
transfere por pergunta de preço**. Ele responde. Só encaminha quando há intenção
de fechar, cancelar, negociar ou comparar com concorrente.

Quando encaminha, um segundo agente monta o resumo — nome do cliente, assunto e
número — e envia ao grupo do setor, que assume dali.

---

## Arquitetura

```
   Cliente (WhatsApp)
        │
        ▼
   ┌────────────────────────────────┐
   │  Filtros: grupo? própria? LID? │
   └──────────────┬─────────────────┘
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
   ┌──────────────────────────────────────────────┐
   │            AGENTE PRINCIPAL                  │
   │         memória em PostgreSQL                │
   │                                              │
   │   ┌────────────────┐  ┌───────────────────┐  │
   │   │ DocsCursos     │  │ ValoresCondicoes  │  │
   │   │ grade, níveis, │  │ regras de         │  │
   │   │ diferenciais,  │  │ encaminhamento    │  │
   │   │ institucional  │  │ e contatos        │  │
   │   └────────────────┘  └───────────────────┘  │
   │   ┌────────────────┐                         │
   │   │ Think          │                         │
   │   └────────────────┘                         │
   └───────────────────────┬──────────────────────┘
                           ▼
              ┌────────────────────────┐
              │  Switch por setor      │
              └───────────┬────────────┘
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     COMERCIAL       FINANCEIRO      SECRETARIA
          │               │               │
          └───────────────┴───────────────┘
                          ▼
              ┌────────────────────────┐
              │  Agente de resumo      │
              │  nome + assunto + nº   │
              │  → grupo do setor      │
              └────────────────────────┘


   FLUXO PARALELO — troca de número
   Cliente informa novo número → registra e avisa o grupo

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp (Evolution API) | Canal, mídia, presença, marcação de lida |
| Redis | Bloqueio humano e buffer de mensagens |
| PostgreSQL | Memória do agente e sub-agentes |
| Supabase | Registro de contatos e atendimentos |
| OpenAI | Agentes, transcrição de áudio, visão e leitura de PDF |

---

## Decisões técnicas

### Responder preço em vez de transferir

Decisão que inverte o padrão comum em atendimento comercial, e é o ponto central
deste fluxo.

O reflexo do setor é tratar pergunta de preço como oportunidade de venda e
transferir imediatamente para um vendedor. O efeito real é fila cheia de gente
que só queria um número, e vendedor gastando tempo com quem não está decidindo.

Aqui o agente responde valores direto da base. A transferência acontece quando
existe **intenção**, não curiosidade: fechar, cancelar, negociar, comparar com
concorrente ou pedido explícito de falar com humano.

As duas regras negativas estão escritas literalmente na ferramenta: não acionar o
Comercial só porque perguntaram o preço, e não acionar para tirar dúvida sobre
cursos.

### Reclamação de preço vai para Financeiro, não Comercial

Distinção sutil e correta. Quem pergunta o preço quer informação — isso o agente
resolve. Quem reclama do preço ou pede desconto maior quer negociação, e quem
negocia condição é o Financeiro.

Mandar reclamação de valor para o Comercial gera mais uma transferência interna,
que é exatamente o que o sistema veio eliminar.

### Duas bases separadas por função

`DocsCursos` guarda o que a instituição **é** — grade, níveis, diferenciais,
endereço. `ValoresCondicoes` guarda o que o agente **faz** — quando encaminhar,
para quem, com qual horário.

A separação importa porque as duas mudam em ritmos diferentes: grade curricular
muda por semestre; escala de setor e contato de atendente mudam com frequência.
Misturar as duas faria qualquer troca de atendente exigir mexer no conteúdo
institucional.

### Horário por setor, não global

Cada setor tem janela própria, incluindo intervalo de almoço em um deles. O
agente informa a janela correta ao encaminhar.

Encaminhar às 12h para um setor que volta às 13h30, sem avisar, gera cliente
achando que foi ignorado.

### Resumo estruturado no encaminhamento

O agente de saída monta uma mensagem padronizada com nome, assunto e número, e
envia ao grupo do setor. Instrução explícita: o resumo não repete o nome dentro
do corpo do assunto.

Grupo de WhatsApp com mensagem padronizada é escaneável; com texto livre, vira
ruído e o time para de ler.

### Fluxo de troca de número

Um webhook separado trata o caso do cliente que informa número novo: registra e
avisa o grupo.

Em instituição de ensino o vínculo dura anos e o telefone muda no meio. Sem esse
tratamento, o histórico do aluno se fragmenta em dois contatos.

---

## Resultado

A pergunta mais frequente — valores — deixou de ocupar a fila do Comercial. O
time comercial passou a receber contato com intenção de decisão, não curiosidade.

E o encaminhamento entre três setores com regras e horários distintos passou a
acontecer na entrada, com resumo pronto para quem assume.

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
- [ ] PostgreSQL — memória dos agentes
- [ ] Supabase — contatos e atendimentos

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
GRUPO_COMERCIAL
GRUPO_FINANCEIRO
GRUPO_SECRETARIA
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Nome e razão social da instituição, CNPJ,
> endereço, telefones, e-mails, redes sociais, nomes de funcionários e
> credenciais foram substituídos por valores fictícios. Nenhum dado de aluno ou
> responsável acompanha este arquivo.
