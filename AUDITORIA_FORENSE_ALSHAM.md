# AUDITORIA FORENSE ALSHAM — BROCRAFT

**Data:** 13 de março de 2026  
**Auditor:** Cursor — Protocolo Forense ALSHAM v1.0  
**Repositório:** https://github.com/AbnadabyBonaparte/brocraft  
**Branch default:** `main`

---

## 1. IDENTIDADE DO PROJETO

| Campo             | Valor                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nome              | BROCRAFT                                                                                                                                                                               |
| Descrição         | Assistente de IA gamificado para fermentação e artesanato alimentar (cerveja, queijos, fermentados, destilados). Chat com IA, XP/ranks/badges, receitas por nível, comunidade, Stripe. |
| Tipo              | Webapp (SPA + API)                                                                                                                                                                     |
| Stack             | React 19 + Vite 7 + TypeScript 5.9 + Tailwind 4 + Drizzle ORM + MySQL + tRPC + Express                                                                                                 |
| Framework         | React (Vite)                                                                                                                                                                           |
| Linguagem         | TypeScript                                                                                                                                                                             |
| Build tool        | Vite 7                                                                                                                                                                                 |
| Deploy            | Vercel (vercel.json; buildCommand: pnpm build)                                                                                                                                         |
| Total de arquivos | 196 (excl. node_modules/.git/dist)                                                                                                                                                     |
| Total de linhas   | ~25k+ (ts/tsx/css)                                                                                                                                                                     |
| Construído por    | **Manus** (vite-plugin-manus-runtime, ManusDialog, forge.manus.im, Manus SDK)                                                                                                          |

---

## 2. COMPARATIVO COM 6 LEIS ALSHAM

### LEI 1: ZERO CORES HARDCODED

- **Status:** ❌ **VIOLAÇÃO GRAVE**
- **Hex hardcoded em TSX/TS:** 2 arquivos (UpgradeSuccess fallbacks `#d4af37`/`#d67a2c`/`#b497ff`; chart.tsx recharts `#ccc`/`#fff` em classes).
- **Tailwind hardcoded:** **~230+ ocorrências** em **25 arquivos** (bg-gray-_, text-white, text-gray-_, border-gray-_, bg-blue-_, etc.). Páginas mais afetadas: Community (40), Recipes (24), Home (22), Privacy (20), ConversationHistory (19), PricingSection (16), Terms (14), Badges (11), UpgradeCancel (11), RecipeLevelModal (10), além de componentes comuns e vários componentes UI (slider, sheet, dialog, button, badge, etc.).
- **SSOT de cores:** **EXISTE** — `client/src/styles/theme.css` define `--theme-*` (root + data-theme="light") e `client/src/index.css` mapeia para Tailwind via `@theme inline`. O projeto **tem** sistema de temas canônico, mas **as páginas e vários componentes não o utilizam** e usam gray/white/blue diretamente.

### LEI 2: COMPONENTES UI PADRONIZADOS

- **Status:** ✅ **CONFORME**
- **Detalhes:** 53+ componentes shadcn/ui em `client/src/components/ui/` (Radix primitives + Tailwind). Card, Button, Input, Select, Dialog, Tabs, Skeleton, Spinner, etc. Padrão de import `@/components/ui/*`. Componentes de página (ChatBox, HeroSection, PricingSection, etc.) usam esses primitivos.

### LEI 3: DADOS 100% REAIS

- **Status:** ✅ **CONFORME**
- **Mock/placeholder:** Nenhum array ou objeto mock (ex.: mockData, DUMMY_DATA). Ocorrências de "placeholder" são **apenas props de UI** (placeholder de input/select), e "hasFakeCaret" é do lib input-otp — não constituem dados falsos.
- **Fonte de dados:** Drizzle ORM + MySQL (schema em `drizzle/schema.ts`); tRPC para API; dados de receitas, usuários, mensagens, comunidade, badges vêm do backend/DB.

### LEI 4: TEMAS DINÂMICOS

- **Status:** ⚠️ **PARCIAL**
- **Dark/Light:** Sim — `ThemeContext`, `data-theme="light"` em theme.css, `ThemeProvider` em App (defaultTheme="light", switchable comentado). Variáveis `--theme-*` cobrem root e light. **Problema:** muitas páginas ignoram o tema e usam classes gray/white fixas, então a troca de tema não reflete corretamente em várias telas.

### LEI 5: ESTADOS UI COMPLETOS

- **Status:** ✅ **BOM**
- **Loading/Error/Empty:** Loading (Spinner, Skeleton, Loader2, "Carregando...") e estados vazios ("Nenhuma receita", "Nenhuma conversa", "Faça login") presentes em App (RouterFallback), Home, Recipes, Badges, ConversationHistory, Community, etc. ErrorBoundary no App. Suspense + lazy para rotas. Cobertura razoável.

### LEI 6: ESTRUTURA CANÔNICA

- **Status:** ✅ **CONFORME**
- **Padrão:** client/ (src: pages, components, contexts, hooks, lib, shared, \_core), server/ (\_core, routers), shared/, drizzle/, api/. Rotas centralizadas em ROUTES (shared/routes). SSOT de constantes. Estrutura clara e previsível.

---

## 3. FUNCIONALIDADES ESPECÍFICAS BROCRAFT

| Feature                 | Existe | Funciona                                                       | Qualidade                                                |
| ----------------------- | ------ | -------------------------------------------------------------- | -------------------------------------------------------- |
| IA Assistant            | Sim    | Sim (Forge/Manus API em server/\_core/llm.ts)                  | Boa — chat com IA, tools, cache Redis                    |
| Gamificação (XP/Levels) | Sim    | Sim (users.xp, rank, tier, streak no schema)                   | Boa — ranks NOVATO → LEGEND, tiers FREE/MESTRE/CLUBE_BRO |
| Receitas de fermentação | Sim    | Sim (recipes com category, difficulty, rajado/classico/mestre) | Boa — listagem, filtros, níveis                          |
| Sistema de achievements | Sim    | Sim (badges, Badges.tsx, userRecipes)                          | Boa                                                      |
| Chat com IA             | Sim    | Sim (ChatBox, AIChatBox, tRPC chat)                            | Boa                                                      |
| Perfil do usuário       | Sim    | Sim (gamification.getProfile, ProfileCard)                     | Boa                                                      |
| Database de receitas    | Sim    | Sim (Drizzle recipes + seed)                                   | Boa                                                      |

---

## 4. SCORECARD

| Dimensão             | Nota (0-10) | Observação                                                                                             |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| Arquitetura          | 8,5         | client/server/shared/drizzle bem separados, tRPC, lazy routes                                          |
| Estilização / Design | 4,0         | SSOT tema existe; violação massiva de cores hardcoded nas páginas                                      |
| Dados & Backend      | 8,0         | Dados reais, Drizzle, MySQL, sem mocks                                                                 |
| IA / Gamificação     | 8,0         | LLM Forge/Manus, XP/rank/tier/streak/badges implementados                                              |
| Segurança            | 6,0         | .env.example correto; JWT/OAuth; sem CSP/X-Frame-Options explícitos no código                          |
| Performance          | 7,5         | React.lazy em todas as rotas, PWA, cache API no Workbox                                                |
| Testes               | 2,0         | Vitest configurado; **0 arquivos _.test._ / _.spec._**                                                 |
| Documentação         | 7,0         | docs/ com ARCHITECTURE, THEME_SYSTEM_CANONICAL, MATRIZ_GENESIS, env-variables, etc.; **sem CLAUDE.md** |
| Governança AI        | 6,0         | Sem .cursorrules; sem .github/copilot-instructions; pre-commit com lint + check:hardcoded + build      |
| Deploy & CI/CD       | 6,0         | Vercel configurado; **sem GitHub Actions** (.github vazio)                                             |
| **MÉDIA GERAL**      | **6,2/10**  | Projeto sólido em backend e features; arrasto por cores hardcoded, ausência de testes e CI             |

---

## 5. GAPS CRÍTICOS

### 🔴 CRÍTICO

1. **Cores hardcoded em ~25 arquivos** — Viola Lei 1 e quebra consistência com o tema canônico (theme.css/index.css). Páginas como Community, Recipes, Home, Privacy, Terms, UpgradeCancel, Badges, ConversationHistory e componentes (PricingSection, RecipeLevelModal, etc.) usam bg-gray-_, text-white, text-gray-_, border-gray-_ em vez de var(--theme-_) / classes do design system.
2. **Zero testes automatizados** — Nenhum arquivo de teste; Vitest presente só no package.json. Risco alto para refatoração e regressões.
3. **Ausência de CI/CD** — Nenhum workflow no .github; qualidade depende apenas de pre-commit local.

### 🟡 IMPORTANTE

1. **Sem CLAUDE.md / .cursorrules** — Dificulta onboarding de IA e padronização em novos arquivos.
2. **Headers de segurança** — Nenhum Content-Security-Policy, X-Frame-Options ou HSTS configurado no código (Vercel pode injetar via dashboard; não auditado).
3. **Tema switchable comentado** — ThemeProvider com `switchable` comentado; mesmo ativado, muitas telas não refletiriam o tema por causa das cores fixas.

### 🟢 DESEJÁVEL

1. **README.md na raiz** — Ausente (há brocraft/README.md no repo; raiz sem README).
2. **Hex de fallback em UpgradeSuccess** — getColorToken(..., "#d4af37") etc.; preferível usar só variáveis.
3. **chart.tsx** — Classes Recharts com #ccc/#fff; poderiam usar variáveis de tema.

---

## 6. PLANO DE MIGRAÇÃO PARA PADRÃO ALSHAM

### FASE 1 — Eliminar cores hardcoded (Lei 1)

- Substituir em **todas** as páginas e componentes: `bg-gray-*` → `bg-[var(--theme-surface)]` ou tokens do index.css; `text-white`/`text-gray-*` → `text-[var(--theme-text-primary)]`/`text-[var(--theme-text-secondary)]`; `border-gray-*` → `border-[var(--theme-border)]`; etc. Usar o mapeamento do CLAUDE.md do ALSHAM 360° (bg-white → surface, gray-900 → bg, etc.).
- Revisar UpgradeSuccess e chart.tsx para remover hex e usar apenas variáveis.
- Rodar `pnpm run check:hardcoded` até zerar.

### FASE 2 — Testes e CI

- Adicionar testes Vitest para rotas críticas (auth, chat, gamificação) e componentes chave (ChatBox, RecipeCard).
- Criar GitHub Actions: lint + check + build (e opcionalmente testes) em PR/push para main.

### FASE 3 — Governança e documentação

- Criar CLAUDE.md na raiz com regras ALSHAM (zero cores hardcoded, shadcn, dados reais, temas).
- Adicionar .cursorrules ou .github/copilot-instructions com as mesmas diretrizes.
- Garantir README.md na raiz com stack, como rodar e link para docs.

### FASE 4 — Segurança e tema

- Configurar headers de segurança (CSP, X-Frame-Options) via Vercel ou middleware.
- Ativar `switchable` no ThemeProvider e validar todas as páginas em light/dark após Fase 1.

---

## 7. VEREDICTO FINAL

O **BROCRAFT** é um projeto **funcional e bem arquitetado** para um assistente de IA gamificado de fermentação: stack moderna (React 19, Vite 7, Drizzle, tRPC), dados reais em MySQL, sistema de temas definido em CSS (theme.css + index.css), componentes shadcn/ui padronizados, lazy loading e PWA. Foi construído com **Manus** (vite-plugin-manus-runtime, Forge API, ManusDialog) e integra bem IA, gamificação (XP, ranks, badges, streak), receitas por nível e comunidade.

O **principal obstáculo** para o padrão ALSHAM é a **violação massiva da Lei 1 (zero cores hardcoded)**: centenas de classes Tailwind fixas (gray/white/blue) nas páginas e em vários componentes, apesar de existir um design system baseado em variáveis. Isso quebra consistência visual e troca de tema. Além disso, **não há testes** e **não há CI**, o que aumenta o risco em mudanças futuras.

**Vale investir tempo** para: (1) migrar todas as telas para variáveis de tema (Fase 1), (2) introduzir testes e CI (Fase 2) e (3) documentar regras para IA (CLAUDE.md / .cursorrules). Com isso, o projeto fica alinhado ao padrão ALSHAM e mantém a base sólida que já tem.

---

_Auditoria READ-ONLY. Nenhum arquivo do projeto foi alterado exceto a criação deste relatório._
