# Notificação de Incidente de Rede

Automação que identifica, no fluxo normal de atendimento, os clientes afetados
por uma queda de rede, mantém uma lista viva desses contatos e — quando o gestor
dispara pelo painel — verifica a conexão de cada um no ERP e comunica
individualmente quem voltou e quem ainda está fora.

- **Setor:** Telecom / ISP
- **Status:** Em produção
- **Escala:** 115 nós, verificação em massa de conexão, disparo controlado por painel

---

## O problema

Quando cai um POP ou uma rota, o padrão do setor é ruim dos dois lados.

**O cliente** abre chamado, é atendido individualmente por um humano que digita
a mesma resposta pela vigésima vez, e depois não recebe aviso nenhum quando o
serviço volta. Ele descobre testando.

**A operação** afoga o SAC. Uma queda que afeta trezentos assinantes gera
trezentos atendimentos simultâneos sobre a mesma causa, travando a fila para
quem tem problema individual.

E o retorno é o pior momento: quando a rede volta, ninguém tem a lista de quem
reclamou. Comunicar todo mundo é inviável manualmente, então não se comunica —
e parte dos clientes segue achando que continua fora.

Havia ainda uma restrição prática: nem todo cliente que reclama de queda está
realmente afetado pelo incidente. Alguns têm problema local, no próprio
equipamento. Avisar "voltou" para quem nunca esteve no incidente gera novo
chamado.

---

## A solução

O fluxo tem duas fases, separadas de propósito.

**Fase 1 — Coleta contínua.** Enquanto o SAC opera normalmente, o fluxo observa
os atendimentos que chegam na plataforma e filtra os que relatam queda de
conexão. Cada um vira registro numa lista de afetados, com o identificador do
cliente e do contato.

Isso roda o tempo todo, sem intervenção. Quando o incidente é reconhecido, a
lista de quem reclamou já existe.

**Fase 2 — Disparo pelo gestor.** Resolvido o problema, o gestor aciona pelo
painel. A partir daí:

1. O fluxo percorre a lista de afetados
2. Para cada cliente, consulta contrato, login e potência da ONU no ERP
3. Compara o estado atual da conexão com o esperado
4. Quem está online recebe aviso de normalização
5. Quem continua fora recebe mensagem diferente, informando que o time segue
   verificando
6. Cada registro é atualizado e as tabelas temporárias do ciclo são limpas

A decisão do que dizer a cada cliente é individual, baseada no estado real da
conexão dele — não numa mensagem única para a lista toda.

---

## Arquitetura

```
   FASE 1 — COLETA CONTÍNUA

   SAC (atendimentos entrando)
            │
            ▼
   ┌────────────────────────┐
   │  Filtra relatos de     │
   │  queda de conexão      │
   └───────────┬────────────┘
               ▼
   ┌────────────────────────┐
   │  Lista de afetados     │
   │  (Supabase)            │
   │  cliente + contato     │
   └────────────────────────┘


   FASE 2 — DISPARO PELO GESTOR

   Painel do gestor ──webhook──►┌─────────────────────┐
                                │  Carrega a lista    │
                                └──────────┬──────────┘
                                           ▼
                                ┌─────────────────────┐
                                │  Loop por cliente   │
                                └──────────┬──────────┘
                                           ▼
                          ┌────────────────────────────────┐
                          │  ERP: contrato → login →       │
                          │  fibra → potência da ONU       │
                          └────────────────┬───────────────┘
                                           ▼
                                  ┌─────────────────┐
                                  │  voltou?        │
                                  └────┬───────┬────┘
                                       │       │
                                  SIM  │       │  NÃO
                                       ▼       ▼
                        "conexão normalizada"  "ainda verificando"
                                       │       │
                                       └───┬───┘
                                           ▼
                              atualiza registro e limpa
                              tabelas temporárias do ciclo

   [Error Trigger] ──► alerta no WhatsApp em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| SAC (OPA) | Lista atendimentos, mensagens e contatos; envia mensagem ao cliente |
| ERP (IXC) | Contrato, login, dados de fibra e potência da ONU |
| WhatsApp | Disparo por template e mensagens de notificação |
| Supabase | Lista de afetados e controle do ciclo |
| Postgres | Limpeza das tabelas temporárias entre ciclos |

---

## Decisões técnicas

### Coleta contínua, disparo manual

A separação em duas fases é a decisão central. A coleta é automática porque
depende de estar acontecendo no momento do incidente. O disparo é manual porque
só um humano sabe que o problema foi de fato resolvido.

Automatizar o disparo exigiria o sistema inferir sozinho o fim do incidente — e
o custo de errar é alto: avisar "voltou" cedo demais gera uma segunda onda de
chamados, com o cliente já irritado. Aqui, automação faz o trabalho pesado e o
humano dá a ordem.

### Verificar antes de avisar

A alternativa óbvia — disparar a mesma mensagem para a lista toda — é mais
simples e está errada. Parte dos clientes tem problema local que o reparo do POP
não resolve.

Por isso cada cliente passa pela cadeia completa de consulta no ERP: contrato,
login, fibra e potência da ONU. Quem não voltou recebe mensagem diferente,
reconhecendo que o caso dele continua aberto. É a diferença entre comunicação em
massa e comunicação individual em escala.

### Processamento em lote

A verificação roda em loop com controle de lote, porque são quatro consultas ao
ERP por cliente. Sem isso, uma lista grande derruba o tempo de execução e
sobrecarrega o ERP no exato momento em que a operação está lidando com um
incidente.

### Tabelas temporárias com limpeza explícita

O ciclo usa tabelas de trabalho separadas da lista principal, apagadas ao final.
Sem essa separação, um disparo interrompido no meio deixa registro sujo que
contamina o disparo seguinte — e o cliente recebe aviso duplicado.

### Falha nunca silenciosa

Error Trigger dedicado alerta a equipe no WhatsApp em qualquer exceção. Automação
que fala com trezentos clientes durante um incidente é exatamente onde falha
silenciosa vira problema público.

---

## Resultado

O que era comunicação inexistente virou notificação individual verificada. O
cliente que reclamou passou a ser avisado quando o serviço voltou, e quem
continuava fora passou a receber reconhecimento explícito em vez de silêncio.

Do lado da operação, a lista de afetados deixou de ser reconstruída à mão a cada
incidente — ela já existe quando o gestor precisa dela.

---

## Stack

`n8n` · `Supabase` · `PostgreSQL` · `WhatsApp` · `IXC Provedor (REST)` ·
`OPA (REST)`

---

## Rodando

**Credenciais necessárias:**

- [ ] Supabase — URL e service role key
- [ ] Postgres — limpeza das tabelas de ciclo
- [ ] WhatsApp — API e templates aprovados
- [ ] IXC — token do ERP
- [ ] OPA — token da plataforma de SAC

**Variáveis de ambiente:**

```
IXC_BASE_URL
OPA_BASE_URL
OPA_API_TOKEN
WEBHOOK_DISPARO_URL     # endpoint acionado pelo painel do gestor
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Endpoints, tokens, identificadores de
> grupo e nomes de tabela foram substituídos por valores fictícios. A lógica foi
> preservada.
