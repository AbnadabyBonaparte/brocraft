# CLAUDE.md — BROCRAFT v∞

> Leia este arquivo antes de alterar o código.

## Sobre o projeto

**BROCRAFT** é um assistente de IA gamificado para fermentação e artesanato alimentar (cerveja, queijos, fermentados, destilados). Parte do ecossistema ALSHAM.

- **Stack:** React 19 + Vite 7 + TypeScript + Tailwind 4 + Drizzle/MySQL + tRPC + Express
- **UI:** shadcn/ui em `client/src/components/ui/`
- **Deploy:** Vercel

## Regras (padrão ALSHAM)

### 1. Zero cores hardcoded

- **Não use:** `bg-white`, `bg-gray-*`, `text-white`, `text-gray-*`, `border-gray-*`, hex em estilo/className.
- **Use:** variáveis de tema. SSOT em `client/src/styles/theme.css` e mapeamento em `client/src/index.css`:
  - `bg-background`, `bg-card`, `bg-surface` (ou `var(--theme-background)`, `var(--theme-surface)`)
  - `text-foreground`, `text-muted-foreground` (ou `var(--theme-text-primary)`, `var(--theme-text-secondary)`)
  - `border-border` (ou `var(--theme-border)`)

### 2. Componentes UI padronizados

- Use sempre os componentes em `@/components/ui/*` (Card, Button, Input, Select, Dialog, Skeleton, etc.). Não crie divs/buttons customizados para padrões já cobertos.

### 3. Dados 100% reais

- Não use mock/fake/dummy/placeholder data. Dados vêm de tRPC e Drizzle (`server/db.ts`, `server/routers.ts`).

### 4. Temas dinâmicos

- O tema é definido em `theme.css` (root + `[data-theme="light"]`). Novos estilos devem usar variáveis `--theme-*` ou classes do design system para refletir light/dark.

### 5. Estados de UI completos

- Sempre trate loading, erro e estado vazio (Skeleton, mensagens, retry quando fizer sentido).

### 6. Estrutura canônica

- Frontend: `client/src/` (pages, components, contexts, hooks, lib).
- Backend: `server/` (\_core, routers.ts, db.ts).
- Compartilhado: `shared/`. Schema: `drizzle/schema.ts`.

## Comandos

- `pnpm install` — dependências
- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` — build de produção
- `pnpm check` — TypeScript (noEmit)
- `pnpm lint` — ESLint
- `pnpm run check:hardcoded` — checagem de cores hardcoded nos arquivos staged

## Documentação

- `docs/ARCHITECTURE.md` — arquitetura
- `docs/THEME_SYSTEM_CANONICAL.md` — sistema de temas
- `AUDITORIA_FORENSE_ALSHAM.md` — auditoria e plano de migração

---

**Lembrete:** qualidade > velocidade. Zero cores hardcoded; sempre shadcn/ui; dados reais.
