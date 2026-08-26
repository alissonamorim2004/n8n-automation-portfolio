# Agente de Agendamento e Prospecção para Barbearia

Assistente de atendimento em WhatsApp que conduz o agendamento completo —
serviço, profissional, data e horário — consultando a disponibilidade real no
sistema de gestão da barbearia, além de reativar clientes inativos e trabalhar
listas de leads diariamente.

- **Setor:** Serviços / Beleza
- **Status:** Em produção
- **Escala:** 181 nós, agente com sub-agentes, buffer de mensagens em Redis

---

## O problema

Barbearia perde agendamento por três motivos, e nenhum deles é falta de
interesse do cliente.

**Fora do horário.** Boa parte das mensagens chega à noite ou no domingo, quando
não tem ninguém para responder. Cliente que não recebe retorno em minutos procura
outro lugar.

**Durante o corte.** Quem responde o WhatsApp é o mesmo profissional que está com
a máquina na mão. Ou ele para o atendimento presencial, ou o cliente do WhatsApp
espera.

**Cliente que sumiu não volta sozinho.** Quem não aparece há meses precisa ser
lembrado, e ninguém tem tempo para puxar essa lista manualmente.

Havia ainda um requisito que descarta a solução fácil: o agendamento tem que
bater com a agenda real. Bot que "anota o horário" e depois alguém confere gera
conflito de agenda — o que é pior que não ter bot nenhum.

---

## A solução

Um agente atende no WhatsApp e conduz a conversa até o agendamento confirmado,
com quatro capacidades que o separam de um chatbot de fluxo fixo:

**Consulta real de disponibilidade.** Antes de oferecer horário, o agente
consulta a agenda no sistema de gestão. Só oferece o que existe.

**Coleta uma pergunta por vez.** O agente pergunta serviço, depois dia, depois
profissional, depois horário — nunca tudo de uma vez. Formulário disfarçado de
conversa não é atendimento.

**Entende áudio e imagem.** Cliente manda áudio ou foto de referência de corte, e
o fluxo transcreve ou descreve antes de entregar ao agente.

**Reagenda e cancela.** Não é só criar: o agente também remarca e cancela,
atualizando a agenda no sistema.

Em paralelo, três rotinas agendadas rodam sozinhas: lembrete de compromisso
próximo, reativação de cliente inativo há mais de quatro meses, e disparo diário
sobre a lista de leads fornecida pela barbearia.

---

## Arquitetura

```
   Cliente (WhatsApp)
        │
        ▼
   ┌──────────────────────┐
   │  Webhook             │
   └──────────┬───────────┘
              ▼
   ┌──────────────────────────────┐
   │  BLOQUEIO HUMANO (Redis)     │  se um atendente assumiu,
   │  chave de estado por contato │  o agente se cala
   └──────────┬───────────────────┘
              ▼
   ┌──────────────────────────────┐
   │  BUFFER DE MENSAGENS (Redis) │  agrega mensagens fragmentadas
   │  acumula → espera → concatena│  antes de processar
   └──────────┬───────────────────┘
              ▼
   ┌──────────────────────────────┐
   │  NORMALIZAÇÃO DE MÍDIA       │  áudio → transcrição
   │  texto / áudio / imagem      │  imagem → descrição
   └──────────┬───────────────────┘
              ▼
   ┌───────────────────────────────────────────────┐
   │            AGENTE PRINCIPAL                   │
   │  memória de conversa em PostgreSQL            │
   │                                               │
   │  Sub-agentes:      Ferramentas:               │
   │   • serviços        • consulta_agenda         │
   │   • profissionais   • agendar                 │
   │   • Think           • reagendar/cancelar      │
   │                     • calculadora (datas)     │
   └───────────────────────┬───────────────────────┘
                           ▼
              ┌────────────────────────────┐
              │  Webhooks internos         │
              │  → API do sistema de gestão│
              └────────────────────────────┘


   ROTINAS AGENDADAS (independentes)

   ├── Lembrete de compromisso (janelas de 2h / 1h / 30min)
   ├── Reativação de inativos (+4 meses sem visita)
   └── Disparo diário sobre lista de leads (planilha)

   [Error Trigger] ──► alerta no WhatsApp em qualquer falha
```

---

## Integrações

| Sistema | Uso |
|---|---|
| Sistema de gestão da barbearia | Disponibilidade, agendamento, reagendamento e cancelamento |
| WhatsApp (Evolution API) | Recebimento, envio, mídia e indicador de digitação |
| Redis | Buffer de mensagens e estado de bloqueio humano |
| PostgreSQL | Memória de conversa e base de agendamentos |
| Supabase | Controle de disparos, follow-up e leads |
| Google Sheets | Lista de leads fornecida pela barbearia |
| OpenAI | Agente, sub-agentes, transcrição de áudio e visão |

---

## Decisões técnicas

### Buffer de mensagens em Redis

Este é o detalhe que separa atendimento de bot. Cliente no WhatsApp não escreve
um parágrafo — escreve "oi", "queria marcar", "pra sexta", em três mensagens
seguidas. Processar cada uma dispara três respostas do agente e a conversa
descarrila.

As mensagens são acumuladas em Redis, com uma janela de espera antes do
processamento. Quando a janela fecha, tudo é concatenado e entregue ao agente
como uma mensagem só. O cliente percebe isso como alguém que esperou ele
terminar de falar.

A escolha do Redis em vez de banco relacional é pelo padrão de uso: escrita e
leitura rápidas, dado com vida curta, expiração natural.

### Bloqueio humano com estado externo

Quando um atendente assume a conversa, uma chave de bloqueio é gravada e o agente
para de responder aquele contato. O estado fica no Redis, não na execução — o que
significa que sobrevive a reinício do n8n e a qualquer nova mensagem que chegue
enquanto o humano está atendendo.

Automação que atropela humano em atendimento causa mais dano que o trabalho que
economiza.

### Sub-agentes como ferramenta, não prompt inflado

O catálogo de serviços e a lista de profissionais são sub-agentes acessíveis como
ferramenta, não texto colado no prompt principal.

A alternativa — enfiar catálogo inteiro no system prompt — funciona com dez
serviços e degrada com cinquenta: o custo por mensagem cresce, o agente começa a
confundir itens, e qualquer alteração de preço exige mexer no prompt principal.
Com sub-agente, o catálogo é consultado quando é preciso e evolui isolado.

O nó `Think` foi incluído para dar espaço de raciocínio antes da chamada de
ferramenta, reduzindo agendamento com parâmetro errado.

### ID interno nunca vaza para o cliente

Instrução explícita: o agente guarda o ID do serviço para usar na chamada de API,
mas nunca mostra ao cliente. Parece detalhe, mas é o tipo de vazamento que quebra
a ilusão de atendimento humano — e o cliente que vê "ID: 19100" perde a confiança
na conversa.

### Consultar antes de oferecer

O agente é proibido de sugerir horário antes de consultar a agenda, e só pode
consultar depois de ter serviço e data definidos. A ordem importa: consultar cedo
demais gasta chamada à API sem parâmetro suficiente; oferecer sem consultar gera
conflito de agenda.

### Uma pergunta por vez

Regra explícita no prompt. É contraintuitivo do ponto de vista de eficiência —
perguntar tudo junto resolveria em uma mensagem — mas conversa em que o
interlocutor dispara cinco perguntas de uma vez é percebida como formulário, e a
taxa de abandono sobe.

### Memória em PostgreSQL

Conversa de agendamento acontece em ritmo humano: o cliente responde, some, volta
vinte minutos depois. Memória em banco garante que ele retome de onde parou, sem
recomeçar.

---

## Resultado

O atendimento deixou de depender de alguém estar livre. Mensagem à meia-noite ou
no domingo é atendida e agendada, com horário que existe de fato na agenda.

Do lado da retenção, cliente inativo passou a ser reativado por rotina, e a lista
de leads da barbearia passou a ser trabalhada todo dia — duas coisas que, feitas
à mão, simplesmente não aconteciam.

---

## Stack

`n8n` · `OpenAI` · `LangChain Agents` · `Redis` · `PostgreSQL` · `Supabase` ·
`Evolution API (WhatsApp)` · `Google Sheets` · `API do sistema de gestão`

---

## Rodando

**Credenciais necessárias:**

- [ ] OpenAI API — com acesso a transcrição e visão
- [ ] Redis — buffer e bloqueio
- [ ] PostgreSQL — memória e agendamentos
- [ ] Supabase — controle de disparos e leads
- [ ] Evolution API — instância de WhatsApp
- [ ] Google Sheets — planilha de leads
- [ ] API do sistema de gestão

**Variáveis de ambiente:**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
SALON_ID
SHEET_ID_LEADS
```

**Importar:** `Workflows → Import from File → workflow.json`

---

> Workflow sanitizado para publicação. Nome e endereço do estabelecimento, nomes
> de profissionais, telefones, credenciais e identificadores foram substituídos
> por valores fictícios. A lógica de atendimento e agendamento foi preservada.
