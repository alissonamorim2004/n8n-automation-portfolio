# Validação Automática de Ordens de Serviço em NOC

Automação que valida, de ponta a ponta, as ordens de serviço fechadas por
técnicos de campo de um provedor de internet — analisando fotos da instalação,
o relato do técnico e os dados de rede — e decide sozinha se a OS é aprovada e
fechada ou reprovada e devolvida para correção humana.

**Setor:** Telecom / ISP
**Status:** Em produção
**Escala:** 253 nós, 11 integrações com o ERP do cliente, 5 estágios de validação

---

## O problema

Quando um técnico termina uma instalação em campo, ele fecha a OS no aplicativo
com fotos e um relato do serviço. Alguém do NOC precisa conferir tudo antes de
liberar o fechamento.

Essa conferência é densa e repetitiva:

- **Fotos.** Cada instalação gera uma dúzia de imagens — sinal da ONU, ACS,
  fusão, telhado, passagem de cabo, caixa no poste, contrato. Cada tipo tem seu
  próprio critério de aprovação, e o conferente precisa lembrar de todos.
- **Leitura de sinal.** A potência óptica precisa estar dentro da faixa aceita.
  Ler o valor numa foto de power meter e comparar com a regra é conferência
  manual.
- **Relato.** O texto do técnico precisa conter doze itens obrigatórios, com
  regras condicionais entre eles: metragem só é exigida se o cabo foi passado,
  verificação de ONU só se houve substituição.
- **Dados de rede.** Login do cliente, ONU e potência precisam bater com o que
  o técnico relatou.
- **Comodato.** Se o equipamento é comodato, precisa estar registrado no
  sistema.

Feito por pessoa, o processo é lento, varia de conferente para conferente, e
erro só aparece depois — quando o cliente reclama de instalação malfeita que
passou.

---

## A solução

O técnico envia o print da OS finalizada no WhatsApp. A partir daí o fluxo é
inteiro automático:

1. Um modelo de visão faz OCR do print e extrai o ID da OS
2. O sistema busca a OS no ERP e baixa todos os arquivos anexados
3. Cada foto é analisada individualmente contra os critérios do seu tipo
4. O relato do técnico é validado contra a checklist de doze itens
5. Login, ONU e potência de sinal são conferidos direto no ERP
6. Comodato é verificado, quando aplicável
7. Um agente consolida tudo e atribui uma nota percentual

Acima do limiar, a OS é fechada automaticamente no ERP e o resultado vai para o
grupo de WhatsApp. Abaixo, a OS é reprovada com o motivo detalhado, transferida
para o setor humano responsável e o time é notificado.

---

## Arquitetura

```
   Técnico (WhatsApp)
          │  print da OS finalizada
          ▼
   ┌─────────────────┐
   │  Webhook        │──── bloqueio humano (LID / operador assumiu)
   └────────┬────────┘
            ▼
   ┌─────────────────────────────┐
   │  ESTÁGIO 1 — OCR do print   │  GPT-4o vision + Information Extractor
   │  extrai id_os, cliente,     │
   │  assunto, endereço, horário │
   └────────┬────────────────────┘
            ▼
   ┌─────────────────────────────┐
   │  ESTÁGIO 2 — Busca no ERP   │  IXC: su_oss_chamado
   │  valida cliente, assunto,   │       su_oss_chamado_arquivos
   │  se a OS está aberta        │
   └────────┬────────────────────┘
            ▼
   ┌─────────────────────────────┐
   │  ESTÁGIO 3 — Fotos          │  loop por arquivo
   │  baixa, separa PDF de       │  GPT-4o vision, um critério por tipo
   │  imagem, analisa cada uma   │  saída: validado / reprovado + motivo
   └────────┬────────────────────┘
            ▼
   ┌─────────────────────────────┐
   │  ESTÁGIO 4 — Relato         │  IXC: su_oss_chamado_mensagem
   │  checklist de 12 itens com  │  agente com regras condicionais
   │  regras condicionais        │
   └────────┬────────────────────┘
            ▼
   ┌─────────────────────────────┐
   │  ESTÁGIO 5 — Rede           │  IXC: radusuarios, radpop_fibra,
   │  login, ONU, potência,      │       botao_rel_22991 (sinal)
   │  comodato quando aplicável  │       su_oss_mov_comodato_wiz
   └────────┬────────────────────┘
            ▼
   ┌─────────────────────────────┐
   │  CONSOLIDAÇÃO               │  agente calcula nota percentual
   │  fotos + relato + rede      │  sobre aprovados vs. reprovados
   └────────┬────────────────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
   APROVADO    REPROVADO
      │           │
      │           ├── grava relato com o motivo na OS
      │           ├── transfere para o setor humano
      │           └── notifica o grupo
      │
      ├── fecha a OS no ERP
      └── notifica o grupo

   [Error Trigger] ──► alerta no WhatsApp em qualquer falha do fluxo
```

Todo o resultado é persistido no Supabase antes de cada transição de estágio.

---

## Integrações

| Sistema | Endpoint | Uso |
|---|---|---|
| ERP (IXC) | `su_oss_chamado` | Busca a OS e seus dados |
| ERP (IXC) | `su_oss_chamado_arquivos` | Lista os arquivos anexados |
| ERP (IXC) | `visualizar_arquivo_os` | Baixa cada arquivo |
| ERP (IXC) | `su_oss_chamado_mensagem` | Coleta o relato do técnico |
| ERP (IXC) | `radusuarios` | Login do cliente |
| ERP (IXC) | `radpop_radio_cliente_fibra` | Login de fibra |
| ERP (IXC) | `botao_rel_22991` | ONU e potência de sinal |
| ERP (IXC) | `su_oss_mov_comodato_wiz` | Verificação de comodato |
| ERP (IXC) | `su_oss_chamado_fechar` | Fecha a OS aprovada |
| ERP (IXC) | `su_oss_chamado_alterar_setor` | Encaminha a OS reprovada |
| WhatsApp | Evolution API | Entrada do técnico e notificações |
| OpenAI | GPT-4o / GPT-4.1-mini | Visão, agentes e classificação |
| Supabase | `analises` | Persistência e trilha de auditoria |

---

## Decisões técnicas

### Regra de domínio dentro do prompt, não fora

A validação de foto não é "essa imagem parece boa". Cada tipo de arquivo tem
critério próprio, codificado no prompt do analisador:

- **Potência óptica** precisa estar na faixa aceita, com tolerância explícita
  acima do limite. O modelo lê o valor no display do power meter e compara.
- **Organização de cabeamento** distingue contexto: instalação em poste não
  admite o mesmo padrão de acabamento que instalação interna. O critério é
  "cabo não pode estar solto", não "cabo tem que estar bonito" — porque o
  primeiro é objetivo e o segundo reprova técnico bom.
- **ACS Parameter Settings** exige presença explícita do parâmetro na imagem;
  ausência reprova o item.
- **Diferença entre CTO e ONT** tem margem esperada conhecida, usada para
  cruzar a leitura relatada com a medida.

Essa escolha é o núcleo do projeto. Um classificador genérico de imagem não
resolveria: o que decide aprovação é a regra de negócio da operação, não a
estética da foto.

### Checklist condicional no relato

Os doze itens do relato não são independentes. Metragem só é exigida quando o
cabo foi efetivamente passado; verificação de ONU no sistema só dispara quando
o relato indica substituição. Um classificador de texto decide se o ramo de
verificação de ONU precisa ser percorrido, evitando chamada desnecessária ao
ERP e falso reprovado.

A alternativa — exigir todos os doze sempre — geraria reprovação em massa de
serviço correto, e o time pararia de confiar na automação em uma semana.

### Nota percentual em vez de veto binário

A decisão final é uma média sobre itens aprovados e reprovados, comparada com um
limiar configurável pela operação. Uma foto tremida não derruba uma instalação
correta; uma soma de pequenos problemas derruba.

Isso mantém o sistema utilizável na prática — validação binária ou reprovaria
quase tudo, ou passaria quase tudo.

### Reprovar é devolver com contexto, não só barrar

Quando a OS é reprovada, o sistema grava o motivo detalhado no campo de relato
da própria OS, transfere para o setor humano responsável e notifica o grupo. O
humano que assume já recebe a análise pronta, item por item, em vez de começar a
conferência do zero.

### Bloqueio humano

Se um operador humano assumiu a conversa, o fluxo se desliga para aquele
atendimento. Automação que atropela humano em atendimento gera dano maior do que
o trabalho que economiza.

### Falha nunca silenciosa

Um Error Trigger dedicado captura qualquer exceção do fluxo e dispara alerta no
WhatsApp da equipe. Em automação que fecha OS sozinha, falhar em silêncio é pior
que falhar: a OS fica num limbo que ninguém percebe.

### Processamento por lote, com limite

Fotos são processadas em loop com nós de limite, porque uma OS pode ter dezenas
de arquivos e a análise de visão é a parte cara. Sem controle de lote, uma OS
grande estoura tempo de execução e consome quota.

---

## Resultado

O que era conferência manual item a item passou a ser decisão automática com
trilha de auditoria: cada foto aprovada ou reprovada, cada item do relato, a
leitura de sinal e a nota final ficam registrados no banco.

O ganho real não é só tempo. É **consistência** — o critério deixou de variar
conforme quem estava conferindo naquele dia — e **rastreabilidade**, já que
toda decisão fica gravada com o motivo.

---

## Stack

`n8n` · `GPT-4o (visão)` · `GPT-4.1-mini` · `LangChain Agents` · `Supabase` ·
`Evolution API (WhatsApp)` · `IXC Provedor (REST)`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — chave com acesso a modelos de visão
- [ ] Supabase — URL e service role key
- [ ] Evolution API — endpoint e token da instância
- [ ] IXC — token de API do ERP

**Variáveis a ajustar no workflow:**

```
IXC_BASE_URL          # base do webservice do ERP
WHATSAPP_GROUP_ID     # grupo que recebe as notificações
SUPABASE_TABLE        # tabela de persistência das análises
NOTA_MINIMA           # limiar de aprovação da OS
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Endpoints, números de telefone,
> identificadores de grupo e dados de cliente foram substituídos por valores
> fictícios. A lógica de validação foi preservada integralmente.
