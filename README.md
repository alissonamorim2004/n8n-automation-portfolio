# Automações e Sistemas com IA

Coleção de automações de processo e sistemas com IA construídos para clientes
reais e em operação. Cada pasta traz o problema que o projeto resolve, a
arquitetura, as decisões técnicas por trás e o workflow ou código-fonte.

Não são exemplos didáticos. São sistemas rodando em produção, sanitizados para
publicação: nomes de cliente, credenciais e dados pessoais foram substituídos por
valores fictícios, e a lógica foi preservada.

**18 projetos · 9 setores · telecom, saúde, jurídico, contabilidade, logística,
turismo, educação, serviços financeiros e serviços**

---

## Telecom e operação de rede

### [01 — Validação de Ordens de Serviço em NOC](./01-noc-service-order-validation)
Valida de ponta a ponta as OS fechadas por técnicos de campo: analisa as fotos da
instalação com visão computacional, confere o relato contra uma checklist e
verifica os dados de rede no ERP. Decide sozinha se aprova e fecha, ou reprova e
devolve para correção humana.
`visão computacional` · `regras de domínio` · `integração com ERP` · `253 nós`

### [02 — Pesquisa de Satisfação Pós-Atendimento](./02-post-service-csat-followup)
Contata o cliente 24h após o atendimento, cruzando duas fontes — ordens de serviço
do ERP e tickets da plataforma de SAC. Interpreta a resposta em linguagem natural
e escala para o gestor quando o retorno é negativo.
`normalização multi-fonte` · `classificação` · `WhatsApp Cloud API`

### [03 — Notificação de Incidente de Rede](./03-network-outage-notification)
Coleta continuamente os clientes que relatam queda no SAC. Quando o gestor dispara
pelo painel, verifica a conexão de cada um no ERP e comunica individualmente quem
voltou e quem ainda está fora.
`coleta contínua` · `verificação individual` · `disparo controlado`

---

## Saúde

### [10 — Atendimento Multi-Agente para Clínica](./10-clinic-multi-agent-triage)
Pré-qualificação de pacientes sobre uma base de 27 médicos e dezenas de
procedimentos. Agente principal delega para sub-agentes especializados, cada um
ancorado em documentos mantidos pela própria clínica.
`multi-agente` · `base de conhecimento viva` · `fila de atendimento` · `231 nós`

### [11 — Triagem de Urgência Oftalmológica](./11-ophthalmology-triage-agent)
Triagem de sintoma ocular com protocolos clínicos codificados por nível de
gravidade e roteamento por quadro. Faz follow-up ativo de pacientes em
pós-operatório, perguntando por sinais de complicação.
`protocolo clínico` · `classificação de urgência` · `follow-up ativo`

### [12 — Curadoria de Conteúdo Científico](./12-medical-content-curation)
O médico digita uma especialidade e recebe artigos já triados, traduzidos e
classificados por relevância editorial — não acadêmica —, gravados na planilha da
equipe de marketing.
`busca científica` · `classificação estruturada` · `saída JSON`

### [13 — Conversão para Clínica de Endocrinologia](./13-nutrition-clinic-conversion-agent)
Navega uma tabela de preços combinatória — convênio ou particular, primeira vez ou
retorno, procedimento isolado ou combinado — qualificando antes de responder o
valor.
`qualificação antes de precificar` · `regras condicionais`

---

## Jurídico

### [20 — Triagem e Agendamento para Advocacia](./20-legal-intake-agent)
Recepciona, entende a natureza do caso, responde dúvidas jurídicas gerais sem
prometer resultado, e agenda no Google Agenda. Com guardrails de conformidade às
normas de publicidade da OAB.
`guardrails de compliance` · `5 sub-agentes` · `Google Calendar`

---

## Logística, varejo e serviços

### [04 — Agendamento para Barbearia](./04-barbershop-booking-agent)
Agendamento com consulta de disponibilidade real no sistema de gestão, mais
reativação de inativos e disparo diário sobre lista de leads.
`buffer de mensagens` · `sub-agentes como ferramenta` · `181 nós`

### [31 — Cotação e Rastreio para Transportadora](./31-freight-quote-tracking-agent)
Extrai onze campos obrigatórios de cotação de frete em conversa livre, valida o
pedido e roteia entre cotação, rastreio e avaria.
`extração estruturada` · `checklist como conhecimento`

### [32 — Recepção e Roteamento para Contabilidade](./32-accounting-reception-routing)
Roteia entre seis setores com treze regras explícitas, e opera rotinas de envio de
guias, fechamento de chamado ocioso e controle de expediente.
`tabela de decisão` · `idempotência` · `7 rotinas agendadas`

### [33 — Vendas para Agência de Turismo](./33-travel-package-sales-agent)
Recomenda destinos, envia a galeria de cada pacote, consulta informação atualizada
na internet e encaminha o lead qualificado. Atende WhatsApp e Instagram.
`busca em tempo real` · `dois canais` · `few-shot via planilha`

### [34 — Entrega de Fotos para Estúdio](./34-photo-studio-delivery-agent)
Entrega as fotos certas para cada público — contratantes, convidados, turmas —
gerando links por nível de acesso, com upload de convidados via QR Code.
`permissão como estrutura de pasta` · `Dropbox API` · `291 nós`

### [35 — Agente Multilíngue para Estúdio nos EUA](./35-multilingual-fitness-studio-agent)
Detecta o idioma na primeira mensagem — inglês, português ou espanhol — e conduz
toda a conversa nele. Um agente, uma base, três idiomas.
`detecção de idioma` · `cliente nos EUA` · `51 nós`

---

## Educação

### [40 — Atendimento e Captação para Instituição de Ensino](./40-education-enrollment-agent)
Responde valores direto da base em vez de transferir, e encaminha para Comercial,
Financeiro ou Secretaria conforme a intenção — não a curiosidade.
`roteamento por intenção` · `horário por setor`

---

## Plataforma e infraestrutura

### [41 — Motor de Espelhamento Omnichannel](./41-omnichannel-sac-mirroring)
Núcleo de uma plataforma de SAC: recebe tudo do WhatsApp e do Instagram, normaliza
num formato único e espelha no banco em tempo real, nos dois sentidos.
`normalização de canais` · `espelhamento bidirecional` · `186 nós`

### [50 — Análise de Documentos Cartoriais](./50-notarial-document-analysis)
Plataforma web e pipeline de OCR e IA para cooperativa de crédito: extrai o
conteúdo de matrículas e escrituras, aplica o template de análise da instituição e
devolve o parecer, com custo por análise contabilizado.
`OCR de layout` · `template como dado` · `React + NestJS + n8n`

---

## Protótipos de hackathon

### [42 — Engajamento de Jovens no Cooperativismo](./42-youth-cooperative-engagement-app)
4º lugar. Em vez de explicar melhor o cooperativismo, traduz ele para o formato que
o jovem já usa: feed de vídeo curto, missões, ranking e recompensas reais da
cooperativa.
`React Native` · `Expo` · `gamificação`

### [43 — Alocação de Vagas Escolares por Proximidade](./43-school-enrollment-allocation)
Substitui a fila por ordem de chegada por alocação baseada em distância
casa-escola, com critérios sociais explícitos e acompanhamento público do processo.
`React` · `geolocalização` · `política pública`

---

## Como eu construo automação

Decisões que atravessam os projetos e estão detalhadas nos READMEs individuais:

**Regra explícita onde o critério é arbitrário.** Modelo raciocinando sozinho
acerta o caso óbvio e falha no ambíguo — que é o que custa. Tabela de decisão,
protocolo escrito e checklist versionada transformam o modelo em classificador
com gabarito, e o gabarito é editável por quem entende do negócio.

**Idempotência por padrão.** Webhook dispara duas vezes. Rede cai no meio de uma
execução. Todo fluxo que altera estado tem chave de deduplicação.

**Falha explícita, nunca silenciosa.** Retentativa com backoff onde faz sentido,
escalonamento para humano onde não faz, e registro de tudo que saiu do caminho
feliz.

**Estado fora do fluxo.** Contexto de conversa e progresso de processo ficam em
Redis ou banco, não na execução. Isso permite reiniciar sem perder onde o
atendimento estava.

**Bloqueio humano em todo agente.** Quando uma pessoa assume o atendimento, o
agente se cala. Automação que atropela humano causa mais dano que o trabalho que
economiza.

**Dado do cliente é fonte, não treinamento.** As respostas são ancoradas em
catálogo estruturado e base de conhecimento consultados em tempo de execução.

---

## Stack

**Orquestração:** n8n
**IA:** OpenAI · Anthropic · RAG · visão computacional · transcrição
**Dados:** PostgreSQL · Supabase · Redis
**Integrações:** WhatsApp Business API · Instagram Graph API · Google Calendar ·
Google Docs · Dropbox · ERPs e plataformas de SAC
**Aplicações:** React · NestJS · React Native · TypeScript

---

## Rodando um workflow

```
No n8n: Workflows → Import from File → workflow.json
```

Configure as credenciais e variáveis de ambiente listadas no README de cada
projeto. As credenciais não acompanham o export.

---

## Contato

Alisson Amorim
[LinkedIn](https://www.linkedin.com/in/alisson-amorim-) · [GitHub](https://github.com/alissonamorim2004)
