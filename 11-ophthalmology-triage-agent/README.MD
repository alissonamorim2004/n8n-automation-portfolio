# Triagem de Urgência e Captação para Clínica Oftalmológica

Assistente de atendimento em WhatsApp para clínica de olhos. Além de responder
sobre corpo clínico, exames e convênios, executa **triagem de urgência
oftalmológica** com protocolos clínicos codificados, e faz follow-up ativo de
pacientes em pós-operatório.

- **Setor:** Saúde / Oftalmologia
- **Status:** Em produção
- **Escala:** 151 nós, 8 médicos e 4 bases como ferramentas, fila de 3 atendimentos

---

## O problema

Clínica oftalmológica tem uma categoria de contato que não existe em barbearia,
advocacia ou contabilidade: **o sintoma que é emergência e não parece.**

Descolamento de retina se anuncia como "flashes de luz" e "chuva de moscas
volantes". Endoftalmite pós-injeção aparece como "o olho tá vermelho e um pouco
embaçado". São falas banais, que qualquer recepção trataria como pedido de
agendamento para a semana seguinte — e ambas têm janela terapêutica medida em
horas.

Do outro lado, os contatos comuns:

**Convênio.** "Vocês atendem meu plano?" é a pergunta mais frequente e tem
resposta tabelada.

**Qual médico.** Oito especialistas com subespecialidades diferentes. Paciente
não sabe se catarata e glaucoma são o mesmo médico.

**Pós-operatório sem acompanhamento.** Paciente que fez injeção intraocular vai
para casa e só volta se algo der errado — se ele reconhecer que deu errado.

E há a captação: a clínica precisa saber de onde veio cada paciente (Google,
Instagram, indicação) e converter contato em consulta.

---

## A solução

Um agente atende e dispõe de sete ferramentas especializadas:

| Ferramenta | Função |
|---|---|
| **agente_urgencia** | Protocolos de triagem por gravidade, com médico responsável por quadro |
| **agente_medicos** | Corpo clínico — um documento por especialista |
| **agente_servicos** | Procedimentos e cirurgias |
| **exames** | Exames disponíveis e preparo |
| **convenio/pagamentos** | Convênios aceitos e formas de pagamento |
| **agente_institucional** | Endereço, horários, estrutura |
| **agente_followup** | Pós-operatório ativo e pesquisa de satisfação |

Sobre isso, três mecanismos operacionais: distinção entre primeiro contato e
paciente recorrente, registro da origem do lead, e encaminhamento à secretaria
com nível de urgência classificado.

---

## Arquitetura

```
   Paciente (WhatsApp)
        │
        ▼
   ┌────────────────────────────────┐
   │  BLOQUEIO HUMANO (Redis)       │
   └──────────────┬─────────────────┘
                  ▼
   ┌────────────────────────────────┐
   │  FILA (Redis) — 3 simultâneos  │
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
   │  PRIMEIRO CONTATO?  (Supabase) │
   │  novo x recorrente             │
   └──────────────┬─────────────────┘
                  ▼
   ┌─────────────────────────────────────────────────────┐
   │                 AGENTE PRINCIPAL                    │
   │              memória em PostgreSQL                  │
   │                                                     │
   │   ┌───────────────────────────────────────────┐     │
   │   │  agente_urgencia                          │     │
   │   │  🔴 imediata · 🟡 24-48h · 🟢 rotina      │     │
   │   │  médico responsável por quadro clínico    │     │
   │   └───────────────────────────────────────────┘     │
   │                                                     │
   │   ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
   │   │ medicos      │ │ servicos     │ │ exames     │  │
   │   │ 8 documentos │ │              │ │            │  │
   │   └──────────────┘ └──────────────┘ └────────────┘  │
   │   ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
   │   │ convenios    │ │institucional │ │ followup   │  │
   │   └──────────────┘ └──────────────┘ └────────────┘  │
   │   ┌──────────────┐ ┌──────────────────────────────┐ │
   │   │ Think        │ │ lead → registra origem       │ │
   │   └──────────────┘ └──────────────────────────────┘ │
   └────────────────────────┬────────────────────────────┘
                            ▼
              ┌──────────────────────────────┐
              │  encaminhar_secretaria       │
              │  nome · motivo · convênio ·  │
              │  resumo · NÍVEL DE URGÊNCIA  │
              └──────────────────────────────┘

   [Error Trigger] ──► alerta em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| WhatsApp (Evolution API) | Canal, mídia, presença, envio de documentos |
| Google Docs | Base por médico e por área (procedimentos, exames, convênios) |
| Redis | Bloqueio humano, fila e buffer |
| PostgreSQL | Memória do agente e de cada sub-agente |
| Supabase | Cadastro de pacientes, origem do lead, primeiro contato |
| OpenAI | Agentes, embeddings, transcrição, visão e leitura de PDF |

---

## Decisões técnicas

### Protocolo clínico como tabela de decisão

O sub-agente de urgência não avalia gravidade por raciocínio livre. Ele tem
protocolos escritos, organizados em três níveis, cada um com o conjunto de
sintomas que o caracteriza e o médico responsável por aquele quadro.

Isso é deliberado. Um modelo raciocinando sozinho sobre sintoma ocular vai acertar
o caso óbvio e falhar exatamente onde importa — no sintoma discreto com janela
curta. Protocolo explícito transforma o modelo em classificador contra um
gabarito escrito por quem entende do assunto.

E o roteamento é por quadro clínico, não por escala: quem opera catarata não é
quem trata retina, e o protocolo já diz qual médico chamar para cada situação.

### Nível de urgência viaja com o encaminhamento

Ao encaminhar para a secretaria, o agente envia nome, motivo, convênio, resumo e
**classificação de urgência** — normal, atenção ou urgente.

Sem esse campo, o caso urgente entra na mesma fila do pedido de segunda via de
receita, e a triagem que o sistema acabou de fazer se perde no último metro.

### Follow-up ativo, não reativo

O sub-agente de follow-up contata o paciente dois dias após injeção intraocular e
**pergunta ativamente** por dor, embaçamento e vermelhidão — em vez de esperar que
ele reclame.

A justificativa é clínica: complicação pós-injeção evolui rápido, e o paciente
tende a normalizar sintoma inicial. Se qualquer resposta for positiva, o
follow-up escala direto para o sub-agente de urgência.

Esse encadeamento — um sub-agente acionando outro por critério clínico — é o que
transforma a rotina de cortesia em rede de segurança.

### Pesquisa de satisfação no momento certo

O pedido de avaliação no Google só acontece **depois** de o paciente confirmar que
correu tudo bem. Nunca antes, nunca junto com a pergunta sobre sintomas.

Pedir avaliação a quem está com dor no pós-operatório é a forma mais rápida de
conseguir uma avaliação ruim.

### Origem do lead capturada na conversa

Uma ferramenta grava de onde veio o paciente — Google, Instagram, Facebook,
indicação — a partir do que ele conta naturalmente, sem formulário.

É a métrica que a clínica precisa para saber onde investir, coletada sem
atravessar o atendimento.

### Um documento por médico

Mesmo padrão do outro case de saúde: cada especialista é um documento consultado
como ferramenta. A clínica edita, o agente responde diferente na conversa
seguinte, sem deploy.

---

## Ponto em aberto: divulgação da natureza do agente

O prompt instrui o agente a se apresentar como humana e a desviar caso o paciente
pergunte se está falando com uma IA.

Registro isso como decisão do cliente, e não como recomendação. Em contexto de
saúde, com triagem de urgência envolvida, o argumento contrário é forte:
paciente que descobre depois que recebeu orientação sobre sintoma ocular de um
sistema automatizado tem motivo legítimo para se sentir enganado, e o dano à
confiança na clínica é maior do que o ganho de naturalidade.

A alternativa — assumir a condição de IA quando perguntado diretamente, mantendo o
tom acolhedor — está implementada em outro projeto deste portfólio
([agente jurídico](../20-legal-intake-agent)), e é a que eu defenderia aqui.

---

## Resultado

A clínica passou a ter triagem de urgência na porta de entrada, funcionando fora
do horário comercial, com protocolo consistente e roteamento por quadro clínico.

Paciente de pós-operatório passou a ser procurado ativamente em vez de depender de
reconhecer sozinho que algo está errado. E a secretaria passou a receber contatos
já classificados por urgência, com convênio e motivo identificados.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `Redis` · `PostgreSQL` · `Supabase` ·
`Evolution API (WhatsApp)` · `Google Docs API`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com transcrição, visão e embeddings
- [ ] Evolution API — instância de WhatsApp
- [ ] Google Docs — service account com acesso à base
- [ ] Redis — bloqueio, fila e buffer
- [ ] PostgreSQL — memória dos agentes
- [ ] Supabase — pacientes e origem de lead

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
WEBHOOK_ENCAMINHAR_URL
GOOGLE_DOC_IDS          # um por médico e por base
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Nome da clínica, nomes dos médicos,
> telefones pessoais dos plantonistas, cidade, domínio, credenciais e IDs de
> documento foram substituídos por valores fictícios. Nenhum dado de paciente
> acompanha este arquivo. Os protocolos de triagem foram preservados em estrutura,
> com identificação removida.
