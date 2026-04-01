# Chat Roadmap — Portfolio Maximization

## Context

### Goal

Diagnosticar o estado atual do chat "Fortuna" e mapear todas as oportunidades de melhoria que aumentem diretamente o valor entregue ao usuário no sentido de maximizar lucros e qualidade de decisões de investimento. Objetivo desta fase: roadmap completo com prioridades antes de qualquer implementação.

### Acceptance Criteria (para o roadmap)
- [ ] Diagnóstico documentado do que o chat faz hoje vs o que poderia fazer
- [ ] Lista exaustiva de oportunidades agrupadas por categoria
- [ ] Priorização por impacto (em lucros/decisões) × esforço de implementação
- [ ] Aprovação do usuário sobre qual(is) features implementar primeiro

### Out of Scope
- Execução de transações (sistema é read-only por design)
- Integração com corretoras externas
- Notificações push / e-mail
- Análise de ativos fora da carteira do usuário (pesquisa de novos ativos)

### Edge Cases
- Contexto da página limitado a 15k chars → features que precisam de mais dados devem carregar contexto server-side
- Usuário sem relatórios → chat não tem dados reais, respostas serão genéricas
- Usuário com apenas 1 relatório → análises de tendência/evolução não são possíveis

### Q&A Record
- Q: Qual é o foco principal? → A: Descoberta & exploração completa (roadmap antes de implementar)
- Q: Horizonte de tempo? → A: Roadmap completo
- Q: Quais capacidades mais usa hoje? → A: Perguntas sobre dados + análise e insights

---

## Diagnóstico: Estado Atual

### O que o chat faz hoje (✅)

**Análise de dados da carteira:**
- Patrimônio, rentabilidade mensal/anual/desde início
- Comparação com benchmarks (CDI, Ibovespa, IPCA)
- Melhores/piores ativos do mês
- Alocação por categoria e por estratégia
- Eventos financeiros (dividendos, JCP, rendimentos)
- Análise de risco-retorno (meses acima/abaixo do benchmark)

**Interação:**
- Streaming em tempo real
- Extended thinking (modo "Extendido")
- Seleção de modelo (Haiku/Sonnet/Opus)
- Sugestões de follow-up chips
- Highlight visual de cards na tela
- Salvar mensagens importantes (bookmark)
- Histórico de conversas persistente (100 msgs/conversa)
- Auto-complete de input (3+ chars, debounce 600ms)

**Contexto por página:**
- Dashboard: resumo completo + benchmarks + top performers
- Insights: resumo executivo + insights categorizados
- Desempenho: dados históricos do ativo individual + análise em cache
- Trends: dados de mercado (índices, setores, macro)

### O que o chat NÃO faz (❌ = oportunidades)

Veja seção de oportunidades abaixo.

---

## Mapa de Oportunidades

As oportunidades estão agrupadas em 5 eixos estratégicos.

---

### Eixo 1 — Proatividade: Chat que Avisa, Não Só Responde

**Problema:** O chat é 100% reativo — o usuário precisa saber o que perguntar. Quem quer maximizar lucros precisa de alertas proativos.

| # | Feature | Descrição | Impacto | Esforço |
|---|---------|-----------|---------|---------|
| 1.1 | **Mensagem de boas-vindas contextual** | Ao abrir o chat, Fortuna mostra uma frase dinâmica baseada nos dados reais: "Sua carteira subiu **+3.2%** no mês — acima do CDI (2.1%). Quer ver o que puxou?" | Alto | Baixo |
| 1.2 | **Digest semanal via chat** | Quando o usuário abre o chat às segundas, recebe um resumo automático de 3 bullet points: o que mudou na semana | Alto | Médio |
| 1.3 | **Alerta de insights pendentes** | Se o usuário tem N insights de alta prioridade não atuados, a Fortuna menciona isso no início da conversa | Médio | Baixo |
| 1.4 | **Alerta de concentração excessiva** | Se algum ativo representa > 20% da carteira, Fortuna comenta proativamente | Alto | Baixo |

---

### Eixo 2 — Profundidade Analítica: Análises Que Hoje Não Existem

**Problema:** A Fortuna responde perguntas simples bem, mas não executa análises complexas que demandam raciocínio multi-etapa sobre os dados.

| # | Feature | Descrição | Impacto | Esforço |
|---|---------|-----------|---------|---------|
| 2.1 | **Diagnóstico de rebalanceamento** | "Dada minha alocação atual X vs ideal Y, quanto exatamente devo mover de cada ativo para atingir o alvo?" Com cálculo passo a passo em reais | Alto | Médio |
| 2.2 | **Simulação de aporte** | "Se eu investir R$2.000 amanhã, qual seria o impacto na minha alocação? Onde você recomenda colocar?" — Fortuna calcula projeção | Alto | Médio |
| 2.3 | **Análise de custo de oportunidade** | "Este ativo está rendendo X% mas poderia estar em CDI+2%. Qual o custo acumulado de mantê-lo nos últimos 12 meses?" | Alto | Médio |
| 2.4 | **Tracking de tese de investimento** | Usuário documenta: "Comprei PETR4 porque esperava dividendos crescentes." Fortuna avalia periodicamente se a tese está se confirmando | Médio | Alto |
| 2.5 | **Análise de timing de entrada/saída** | Para ativos com histórico completo, avaliar se o timing de compra/venda foi bom vs alternativas | Médio | Médio |
| 2.6 | **Correlação entre ativos** | Identificar ativos que se movem juntos na carteira (risco oculto de concentração setorial) | Alto | Alto |
| 2.7 | **Análise de renda passiva** | "Quanto de renda passiva sua carteira gera mensalmente? Qual a taxa de yield-on-cost dos seus ativos?" | Alto | Baixo |

---

### Eixo 3 — Integração com Ações: Chat Que Gera Valor Concreto

**Problema:** As conversas terminam com insights mas sem desdobramentos — o usuário precisa lembrar manualmente o que fazer.

| # | Feature | Descrição | Impacto | Esforço |
|---|---------|-----------|---------|---------|
| 3.1 | **Criar item de plano de ação direto do chat** | Fortuna pode criar um item na tabela `itens_plano_acao` durante a conversa: "Posso registrar isso como tarefa para você: 'Rebalancear para reduzir PETR4 de 25% para 15%'?" | Alto | Médio |
| 3.2 | **Quick actions nos botões** | Após resposta da Fortuna, mostrar botões contextuais: [Ver análise do ativo] [Ir para insights] [Ver relatório] | Médio | Baixo |
| 3.3 | **Gerar/atualizar insights via chat** | "Gere os insights do mês de março para mim" — aciona `GerarInsightsUseCase` via chat sem precisar ir à página de insights | Médio | Médio |
| 3.4 | **Marcar insight como concluído via chat** | "Já rebalanceei minha carteira como você sugeriu" → Fortuna marca o insight como `concluída` na tabela | Médio | Médio |

---

### Eixo 4 — Contexto Mais Rico: Fortuna Sabe Mais Sobre o Usuário

**Problema:** Cada conversa começa do zero. A Fortuna não sabe o histórico de decisões, metas, perfil de risco ou o que o usuário já tentou.

| # | Feature | Descrição | Impacto | Esforço |
|---|---------|-----------|---------|---------|
| 4.1 | **Contexto multi-período sempre disponível** | Ao invés de só o mês atual, carregar sempre os últimos 3-6 meses de dados no contexto do chat (todos os relatórios) | Alto | Baixo |
| 4.2 | **Memória de perfil do usuário** | Fortuna pergunta uma vez: "Qual o seu objetivo? (Aposentadoria / Crescimento / Renda)" e usa isso em todas as análises futuras. Salvo em `configuracoes_usuario`. | Alto | Médio |
| 4.3 | **Metas de patrimônio** | Usuário define: "Quero chegar a R$500k até 2028." Fortuna calcula aporte mensal necessário e monitora progresso | Alto | Médio |
| 4.4 | **Perfil de risco explícito** | Integrar questionário simples de perfil (conservador/moderado/arrojado) que molda as recomendações da Fortuna | Médio | Médio |
| 4.5 | **Histórico de decisões** | Fortuna recorda o que foi discutido em conversas anteriores relevantes: "Na semana passada você estava considerando reduzir Renda Fixa. Ainda está pensando nisso?" | Alto | Alto |

---

### Eixo 5 — UX e Qualidade de Interação

**Problema:** A experiência atual é funcional mas não maximiza a probabilidade do usuário agir sobre as recomendações.

| # | Feature | Descrição | Impacto | Esforço |
|---|---------|-----------|---------|---------|
| 5.1 | **Modo de análise profunda (deep dive)** | Botão "Analisar minha carteira completa" — Fortuna recebe contexto completo + todos os insights + histórico e produz uma análise estruturada de 5-10 min | Alto | Baixo |
| 5.2 | **Perguntas iniciais de alta qualidade** | Substituir sugestões genéricas por perguntas calculadas baseadas em dados reais: "Você tem 3 ativos abaixo do CDI — quer revisar?" | Alto | Baixo |
| 5.3 | **Tabelas comparativas inline** | Fortuna gera tabelas comparativas direto na resposta para análises lado a lado (ativo A vs ativo B) | Médio | Baixo |
| 5.4 | **Resposta estruturada para análises** | Para análises complexas, usar formato padronizado: Situação → Diagnóstico → Recomendação → Impacto estimado | Médio | Baixo |
| 5.5 | **Highlight de múltiplos elementos** | Hoje o limite é 1 highlight. Permitir 2-3 highlights simultâneos quando a análise cobre múltiplos cards | Baixo | Baixo |

---

## Priorização (Impacto × Esforço)

### 🔴 Alta prioridade — Fazer primeiro
Features de alto impacto em lucros/decisões com esforço baixo-médio:

| # | Feature | Por que priorizar |
|---|---------|------------------|
| **1.1** | Mensagem de boas-vindas contextual | Mudança de comportamento zero-esforço. Usuário abre chat e já tem contexto. |
| **2.7** | Análise de renda passiva | Dado já disponível. Sistema prompt atualizado. Alto valor para quem foca em dividendos. |
| **4.1** | Contexto multi-período sempre disponível | Pequena mudança no contexto carregado. Impacto enorme na qualidade das análises. |
| **5.1** | Modo de análise profunda (deep dive) | Botão que aciona prompt mais rico. Esforço de UI + prompt adjustment. |
| **5.2** | Sugestões iniciais baseadas em dados reais | Trocar strings hardcoded por função que lê dados e gera perguntas relevantes. |
| **2.1** | Diagnóstico de rebalanceamento | Feature diretamente ligada a decisões de alocação de capital. |
| **3.1** | Criar item de plano de ação via chat | Conecta conversa com ação real. `itens_plano_acao` já existe no DB. |

### 🟡 Média prioridade — Próxima onda
| # | Feature | Por que depois |
|---|---------|----------------|
| **1.3** | Alerta de insights pendentes | Depende de integração com `relatorios_insights` no contexto do chat |
| **2.2** | Simulação de aporte | Requer cálculos extras no sistema prompt |
| **2.3** | Custo de oportunidade | Alto valor mas precisa de dados históricos ricos |
| **4.2** | Memória de perfil do usuário | Requer UI + schema update |
| **4.3** | Metas de patrimônio | Feature nova com cálculos de projeção |
| **3.2** | Quick actions nos botões | Melhora conversão mas não impacta análise em si |

### 🟢 Baixa prioridade — Backlog
| # | Feature |
|---|---------|
| 2.4 | Tracking de tese de investimento (alto esforço, nicho) |
| 2.6 | Correlação entre ativos (alto esforço analítico) |
| 4.5 | Histórico de decisões (alto esforço de memória persistente) |
| 1.2 | Digest semanal (infraestrutura de scheduled tasks) |

---

### Codebase Analysis

#### Existing Patterns to Follow
- Sistema prompt: `src/lib/build-chat-system-prompt.ts` — adicionar seções ao prompt existente
- Serialização de contexto: `src/lib/serialize-*-context.ts` — padrão de funções puras de serialização
- API route: `src/app/api/chat/route.ts` — carrega contexto server-side quando não fornecido pelo cliente
- Action items: tabela `itens_plano_acao` já existe, precisamos só do use case + API route
- Configurações: `src/domain/interfaces/user-settings-repository.ts` — pode ser estendido com perfil/metas

#### Reusable Code Found
- `serializarContextoCompletoUsuario()` — carrega todos os dados do dashboard. Pode ser ampliado para incluir insights + action items
- `GetDashboardDataUseCase` — já carrega todos os relatórios disponíveis; para contexto multi-período, usar diretamente
- `itens_plano_acao` table — já existe no schema, use case de criação precisa ser verificado
- Sugestões iniciais: `src/lib/chat-suggestions.ts` ou similar — trocar por função data-driven

#### Affected Files (estimativa, depende da feature escolhida)
- `src/lib/build-chat-system-prompt.ts` (modify) — novas instruções de análise
- `src/app/api/chat/route.ts` (modify) — contexto multi-período + acionamento de análise profunda
- `src/lib/serialize-chat-context.ts` (modify) — incluir insights + action items no contexto
- `src/components/chat/campo-entrada-chat.tsx` (modify) — sugestões data-driven + botão deep dive
- `src/components/chat/chat-widget.tsx` (modify) — mensagem de boas-vindas contextual
- `src/app/api/action-items/route.ts` (create) — se feature 3.1 for priorizada

#### Risks
- Contexto multi-período aumenta tokens → custo de API mais alto (Médio) — Mitigar: limitar a 3 meses, só dados essenciais
- Criação de action items via chat pode criar duplicatas (Baixo) — Mitigar: deduplication por texto similar
- Mensagem de boas-vindas precisa de contexto carregado antes do chat abrir (Médio) — Mitigar: carregar server-side

---

## Plan

### Visão geral

7 steps sequenciais cobrindo os 3 clusters. Cada step toca ≤ 4 arquivos e mantém o build funcionando. A ordem segue dependências: dados → contexto → prompt → UI → markers.

**Arquivos afetados (total: 11)**

| Arquivo | Tipo |
|---------|------|
| `src/schemas/chat.schema.ts` | modify |
| `src/contexts/chat-page-context.tsx` | modify |
| `src/app/(dashboard)/page.tsx` | modify |
| `src/app/api/chat/route.ts` | modify |
| `src/lib/serialize-full-user-context.ts` | modify |
| `src/lib/chat-suggestions.ts` | modify |
| `src/lib/build-chat-system-prompt.ts` | modify |
| `src/components/chat/chat-input-field.tsx` | modify |
| `src/lib/chat-stream-utils.ts` | modify |
| `src/hooks/use-chat-assistant.ts` | modify |
| `src/components/chat/chat-widget.tsx` | modify |

---

### Steps

#### Step 1 — Cluster A: Resumo estruturado no ChatPageProvider

**Cluster:** A (Fundação de contexto)  
**Files:** `src/schemas/chat.schema.ts` (modify), `src/contexts/chat-page-context.tsx` (modify), `src/app/(dashboard)/page.tsx` (modify)  
**Pattern:** Seguindo padrão existente de `IdentificadorPagina` em `chat.schema.ts`

**Changes:**
- Adicionar interface `ResumoContextoChat` a `chat.schema.ts`:
  ```typescript
  export interface ResumoContextoChat {
    patrimonioTotal: number;          // em centavos
    rentabilidadeMensal: number;      // percentual (ex: 3.21)
    rentabilidadeCDIMensal: number;   // percentual CDI do mês
    melhorAtivo?: string;             // nome do melhor ativo
    melhorAtivoRentabilidade?: number;
    piorAtivo?: string;
    piorAtivoRentabilidade?: number;
    alocacaoDominante?: string;       // categoria com maior %
    totalRelatorios: number;
  }
  ```
- Estender `ChatPageProvider` e `definirContexto` para aceitar `resumo?: ResumoContextoChat`
- Dashboard page (`src/app/(dashboard)/page.tsx`): computar `ResumoContextoChat` de `dadosDashboard` e passar para `definirContexto`

**Verify:** `useChatPageContext()` expõe `resumoContexto` com dados reais ao abrir o dashboard.

---

#### Step 2 — Cluster A: Contexto server-side enriquecido (insights + plano de ação)

**Cluster:** A (Fundação de contexto)  
**Files:** `src/app/api/chat/route.ts` (modify), `src/lib/serialize-full-user-context.ts` (modify)  
**Pattern:** `route.ts` já carrega `GetDashboardDataUseCase`; seguir mesmo padrão para insights e action plan

**Changes:**
- Em `route.ts`: além do dashboard, carregar:
  - Insights do mês mais recente via `InsightsRepository.obterMaisRecente(userId)`
  - Itens pendentes do plano de ação via `PlanoAcaoRepository.listarItensDoUsuario(userId)` (filtrar só `status: "pendente"`)
- Em `serialize-full-user-context.ts`: adicionar seções:
  ```
  ## Insights Ativos (mês X)
  Prioridade Alta: [lista de 3 insights de alta prioridade com título + ação sugerida]
  Prioridade Média: [contagem]
  
  ## Plano de Ação Pendente
  - [ID curto] [texto_original] (tipo: positivo/atencao/neutro)
  ```
- Manter limite de 15k chars; se ultrapassar, omitir seções menos críticas primeiro (movimentações > liquidez > retornos mensais)

**Verify:** Ao perguntar "quais são meus insights pendentes?", Fortuna lista corretamente sem precisar estar na página de insights.

---

#### Step 3 — Cluster A: Boas-vindas contextual + sugestões data-driven

**Cluster:** A  
**Files:** `src/lib/chat-suggestions.ts` (modify), `src/components/chat/chat-widget.tsx` (modify)  
**Pattern:** `INITIAL_SUGGESTIONS` já existe em `chat-suggestions.ts`; adicionar função ao lado

**Changes:**
- Em `chat-suggestions.ts`: adicionar função `gerarSugestoesDashboard(resumo: ResumoContextoChat): string[]` que retorna 4 sugestões baseadas em dados reais:
  - Se `rentabilidadeMensal > rentabilidadeCDIMensal`: "Por que bati o CDI esse mês?"
  - Se `rentabilidadeMensal < rentabilidadeCDIMensal`: "Por que fiquei abaixo do CDI?"
  - Se `melhorAtivo`: `Por que ${melhorAtivo} foi o melhor ativo?`
  - Se `piorAtivo`: `${piorAtivo} vale manter?`
  - Sempre: "Como está minha diversificação?"
- Adicionar função `gerarBoasVindas(resumo: ResumoContextoChat): string` que retorna uma frase contextual (não uma mensagem de chat, mas um subtítulo no estado vazio)
- Em `chat-widget.tsx`:
  - Quando `identificadorPagina === "dashboard"` e `resumoContexto` disponível: usar `gerarSugestoesDashboard()` em vez das sugestões estáticas
  - Mostrar a mensagem de boas-vindas como `CardDescription` no empty state (acima dos chips, não como mensagem de assistente)

**Verify:** Abrir chat no dashboard mostra sugestões personalizadas com nomes reais de ativos.

---

#### Step 4 — Cluster B: System prompt — análise profunda + rebalanceamento

**Cluster:** B (Análise profunda)  
**Files:** `src/lib/build-chat-system-prompt.ts` (modify)  
**Pattern:** Arquivo já tem seções para highlighting e suggestions; adicionar novas seções de instrução

**Changes:**
- Adicionar seção `## ANÁLISE COMPLETA` ao system prompt:
  - Quando usuário pede "análise completa" ou "analisar minha carteira", usar formato estruturado:
    ```
    **Situação atual:** [1-2 frases com patrimônio + rentabilidade + benchmark]
    **Diagnóstico:** [3 bullets: o que está funcionando, o que não está, risco principal]
    **Recomendações:** [3 ações concretas ordenadas por impacto]
    **Próximo passo:** [1 ação específica e imediata]
    ```
- Adicionar seção `## DIAGNÓSTICO DE REBALANCEAMENTO`:
  - Quando usuário pede rebalanceamento, calcular: para cada categoria com % atual, identificar desvio em relação a uma alocação equilibrada baseada em perfil deduzido da carteira, calcular R$ exato para mover (usando patrimônioTotal do contexto)
  - Sempre mostrar tabela: Categoria | Atual % | Sugerido % | Ação | Valor R$
- Adicionar instruções de consciência sobre insights e plano de ação (seção nova):
  - Se contexto tem insights pendentes de alta prioridade, proativamente mencionar no início da resposta se relevante

**Verify:** Perguntar "analise minha carteira" produz resposta nos 4 blocos. Perguntar "como rebalancear" produz tabela com valores em R$.

---

#### Step 5 — Cluster B: Botão "Análise completa" no input

**Cluster:** B  
**Files:** `src/components/chat/chat-input-field.tsx` (modify)  
**Pattern:** O campo já tem chips de sugestões como overlay; adicionar chip especial

**Changes:**
- Adicionar prop `onAnaliseCompleta?: () => void` ao componente `CampoEntradaChat`
- Mostrar chip "🔍 Análise completa" como chip fixo acima dos outros chips de sugestão, somente quando `identificadorPagina === "dashboard"` e não há mensagens ainda
- Ao clicar: chamar `onAnaliseCompleta()` que envia a mensagem predefinida "Faça uma análise completa da minha carteira" via `onEnviar`
- Em `chat-widget.tsx`: passar `onAnaliseCompleta` para o campo de entrada

**Verify:** Chip aparece no dashboard. Clicar envia mensagem e recebe resposta estruturada em 4 blocos.

---

#### Step 6 — Cluster C: Action items via chat — marker + parsing

**Cluster:** C (Ações concretas)  
**Files:** `src/lib/build-chat-system-prompt.ts` (modify), `src/lib/chat-stream-utils.ts` (modify), `src/hooks/use-chat-assistant.ts` (modify)  
**Pattern:** `[SUGGESTIONS:...]` e `[HIGHLIGHT:...]` já são marcadores parseados em `chat-stream-utils.ts`

**Changes:**
- Em `build-chat-system-prompt.ts`: adicionar instrução para `[ACAO:texto|tipo|ativos]`:
  - Usar quando a resposta contém uma recomendação acionável específica
  - `tipo`: "positivo" | "atencao" | "neutro"
  - `ativos`: lista separada por vírgula (pode ser vazio)
  - Máximo 1 por resposta; apenas para recomendações de alto impacto
  - Exemplo: `[ACAO:Reduzir PETR4 de 25% para 15% da carteira|atencao|PETR4]`
- Em `chat-stream-utils.ts`: adicionar `parsearAcaoPendente(text): AcaoPendente | null` que extrai o marcador e retorna `{ texto, tipo, ativos }`; remover marcador do texto limpo
- Em `use-chat-assistant.ts`: adicionar estado `acaoPendente: AcaoPendente | null`; popular após streaming completo via `parsearAcaoPendente`; limpar ao enviar próxima mensagem

**Verify:** Ao pedir recomendação de rebalanceamento, response inclui `[ACAO:...]` marker que é extraído e salvo no estado sem aparecer no texto.

---

#### Step 7 — Cluster C: Action item — confirmação UI + persistência

**Cluster:** C  
**Files:** `src/components/chat/chat-widget.tsx` (modify)  
**Pattern:** Seguir padrão de confirmação do TTS toggle e notification toasts já no chat-widget

**Changes:**
- Em `chat-widget.tsx`: quando `acaoPendente !== null`, renderizar card de confirmação abaixo da última mensagem do assistente:
  ```
  ┌─────────────────────────────────────────────────┐
  │ 💡 Registrar no Plano de Ação?                  │
  │ "Reduzir PETR4 de 25% para 15% da carteira"     │
  │                    [Ignorar] [Criar tarefa →]   │
  └─────────────────────────────────────────────────┘
  ```
- "Criar tarefa": POST `/api/action-plan` com `{ textoOriginal, tipoConclusao, origem: "insight-acao-sugerida", ativosRelacionados }` → `notificar.success()` → limpar `acaoPendente`
- "Ignorar": apenas limpar `acaoPendente`
- Reusa `PlanoAcaoRepository` existente (via API route, sem new use case)

**Verify:** Fluxo completo: pergunta → Fortuna recomenda → card aparece → "Criar tarefa" → item aparece em `/plano-acao` com enrichment automático.

---

### Cross-Cutting Concerns

| Concern | Applies? | Action |
|---------|----------|--------|
| Security | Sim | Validar `textoOriginal` antes de POST (já feito pelo `CriarItemPlanoSchema` na API); garantir `userId` vem do auth, não do cliente |
| Performance | Sim | Step 2: loading insights + action items no chat route adiciona 2 DB queries; ambas têm índices por `usuarioId` — custo mínimo |
| Accessibility | Sim | Card de confirmação (Step 7) deve ter foco gerenciado e ser navegável por teclado |
| Observability | N/A | Features existentes já têm error handling; novos erros de persistência → `notificar.error()` |
| Testing | Sim | `gerarSugestoesDashboard()` e `parsearAcaoPendente()` são funções puras → adicionar unit tests |
| Concurrency | Baixo | `acaoPendente` state: só 1 ação pendente por vez; limpar em `criarNovaConversa()` |
| Memory | N/A | Sem mudanças em estruturas de longa duração |
| API contracts | Sim | `definirContexto()` ganha argumento opcional `resumo`; não breaking (opcional) |
| CI/CD | N/A | Sem novos targets ou dependências |
| Documentation | N/A | Features internas; CLAUDE.md pode ser atualizado pós-implementação |
| Cross-platform | N/A | Web apenas |
| i18n | N/A | App é português fixo por design |

---

### Verification Plan

```bash
# Build
npm run build   # deve passar sem erros

# Type check (mais rápido que build)
npx tsc --noEmit

# Lint
npm run lint

# Tests
npm run test    # incluindo novos testes para gerarSugestoesDashboard + parsearAcaoPendente
```

**Manual checks:**
1. Abrir chat no dashboard → sugestões mostram nomes reais de ativos (Step 3)
2. Perguntar "analise minha carteira" → resposta em 4 blocos estruturados (Step 4)
3. Clicar chip "Análise completa" → envia mensagem e recebe análise (Step 5)
4. Perguntar "como rebalancear?" → Fortuna retorna tabela com R$ (Step 4)
5. Fortuna inclui `[ACAO:...]` → card de confirmação aparece (Step 7)
6. Clicar "Criar tarefa" → item em `/plano-acao` com enrichment (Step 7)
7. Perguntar "quais insights pendentes?" sem estar na página de insights → Fortuna responde com dados reais (Step 2)

---

### Risks

- **Step 2 — Tamanho do contexto** (Médio): Adicionar insights + action plan pode ultrapassar 15k. Mitigação: priorizar seções; insights resumidos a top 3 alta prioridade; action items a texto + tipo apenas; remover seção de movimentações recentes se necessário.
- **Step 4 — Fortuna usando o marker [ACAO]** (Médio): LLMs podem não seguir instrução fielmente ou usar o marker em respostas inadequadas. Mitigação: instruções muito específicas + limite de 1 por resposta + validação antes de mostrar o card.
- **Step 3 — Dashboard sem dados** (Baixo): Se `resumoContexto` for null (usuário sem relatórios), fallback para sugestões estáticas existentes.

---

### Ordem de execução recomendada

Steps 1→2→3 (Cluster A) → Steps 4→5 (Cluster B) → Steps 6→7 (Cluster C)

Cada cluster pode ser commitado independentemente. Se a sessão acabar entre clusters, o build continua funcionando.

---

## Implementation

**Status**: Complete ✅

**Rollback point**: `bd9e025`

### Step Results

| Step | Commit | Files Changed | Notes |
|------|--------|---------------|-------|
| 1 — ResumoContextoChat | `219bc82` | `chat.schema.ts`, `chat-page-context.tsx`, `(dashboard)/page.tsx` | CDI from `comparacaoBenchmarksAtual`, top/worst from performers arrays |
| 2 — Contexto enriquecido | `a5b70f1` | `serialize-full-user-context.ts`, `api/chat/route.ts` | Insights (top 4 high-priority) + pending action items injected server-side |
| 3 — Sugestões data-driven | `cf567f7` | `chat-suggestions.ts`, `chat-widget.tsx`, `chat-body.tsx` | `gerarSugestoesDashboard()` + `gerarBoasVindas()` functions |
| 4 — System prompt profundo | `a8b1ccb` | `build-chat-system-prompt.ts` | 4-block analysis + rebalancing table + [ACAO:] marker instructions |
| 5 — Chip análise completa | `f3336c9` | `chat-suggestions.ts` | "Análise completa da carteira" always first; label length increased to 60 |
| 6 — Parsing [ACAO:] | `e09c51f` | `chat-stream-utils.ts`, `use-chat-assistant.ts` | `parsearAcaoPendente()`, `stripPartialAcaoMarker()`, `acaoPendente` state |
| 7 — UI card + persistência | `1b11867` | `acao-pendente-card.tsx` (new), `chat-widget.tsx`, `use-chat-ui-state.ts` (new) | Self-contained card; extracted `useChatUiState` hook to stay under max-lines |

---

## Post-Mortem

### What went well
- All 7 steps shipped with clean commits and zero test regressions (714 tests passing throughout)
- The marker pattern (`[ACAO:]`, `[SUGGESTIONS:]`, `[HIGHLIGHT:]`) proved to be a robust protocol — easy to extend
- Server-side context enrichment (Step 2) required zero client-side changes and works transparently
- The `ResumoContextoChat` abstraction cleanly separated data computation (dashboard page) from presentation (chat widget)

### What was harder than expected
- **`max-lines: 300` ESLint rule**: `chat-widget.tsx` hit 331 lines after Step 7. Required extracting `useChatUiState` hook to hold suggestions + welcome message memos. Not planned in the original scope.
- **Step 2 insights loading**: The existing `InsightsRepository` didn't have a "get most recent" method — had to load all metadata and sort client-side in the route handler.
- **`formatCompactCurrency` naming**: Wrong function name (`formatarMoedaCompacta`) used initially in `chat-suggestions.ts`, caught immediately by TypeScript.

### Deviations from plan
- Step 7 also created `acao-pendente-card.tsx` as a new file (originally planned as inline JSX in widget) — necessary to keep widget under 300 lines
- Step 7 also created `use-chat-ui-state.ts` (not in original file list) — extracted for same reason
- `handleCriarAcao` fetch logic was moved into `AcaoPendenteCard` itself (prop `onConcluir` vs original `onCriar`/`onIgnorar`) — cleaner API

### Remaining work (future sessions)
- Unit tests for `gerarSugestoesDashboard()` and `parsearAcaoPendente()` (noted in cross-cutting concerns — deferred)
- Monitor if LLM actually uses `[ACAO:]` marker in practice — may need prompt tuning
- Consider rate-limiting the `[ACAO:]` card to once per conversation (currently fires on every qualifying response)
