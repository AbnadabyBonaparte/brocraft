# ARCHITECTURE — BROCRAFT v∞

## Stack & princípios
- Frontend: Vite + React 19 + Wouter, design system shadcn + Radix, tema luxury via tokens em `client/src/index.css` e `client/src/styles/theme.css`.
- Backend: Express + tRPC (`server/_core`, `server/routers.ts`) com Sentry, rate limit e webhooks Stripe.
- Dados/SSOT: esquemas/drizzle em `drizzle`, seeds em `scripts`, tipos compartilhados em `shared`.
- Deploy alvo: Web em Vercel, serviços/infra em Railway; logs e monitoramento já preparados (Sentry, health/version endpoints).

## Mapa de pastas (SSOT)
- `client/`
  - `src/App.tsx`: composição raiz, roteador Wouter, providers de tema/tooltips/toaster.
  - `src/pages/`: rotas de UI (Home, Recipes, Badges, Community, Terms/Privacy, etc.).
  - `src/components/`: UI reutilizável e blocos comuns (ex.: `components/common/Map.tsx`, `components/ui/*`).
  - `src/contexts/`: provedores (ex.: tema).
  - `src/lib/` e `src/hooks/`: utilidades e hooks especializados.
  - `index.css` e `styles/`: tokens de tema luxury e reset global.
- `server/`
  - `_core/`: bootstrap do servidor, env, rate limit, monitoramento, integração Stripe, Vite SSR/static.
  - `routers.ts`: roteadores tRPC e agregação de endpoints.
  - `db.ts`: camadas de dados/cache e seed inicial.
- `shared/`: contratos e tipos compartilhados (SSOT entre client/server).
- `drizzle/` + `drizzle.config.ts`: schema e migrações.
- `scripts/`: automações (seed, checklist suprema, guardas de hardcode).
- `docs/`: SSOT funcional (este arquivo, MATRIZ_GÊNESIS, políticas).

## Fluxo de front-end
1. `main.tsx` monta `<App />` com ThemeProvider + ErrorBoundary.
2. `App.tsx` aplica lazy loading das rotas e fallback com spinner; estados e toasts via providers.
3. Páginas consomem hooks/lib compartilhados e componentes UI com tokens de tema (evitar cores hardcoded novas).

## Fluxo de back-end
1. `server/_core/index.ts` valida env, aplica rate limit e monta endpoints `/api/*` (health, version, stripe webhook, tRPC).
2. `server/db.ts` encapsula acesso a dados/cache; atualize aqui para novas entidades (SSOT de dados). 
3. `server/routers.ts` centraliza roteamento tRPC; novas features devem registrar procedimentos aqui.

## Guard rails e automações
- Pre-commit (Husky): `lint-staged` + `pnpm run check:hardcoded` + `pnpm lint` + `pnpm check` + `pnpm build`.
- Hardcode blocker: `scripts/check-hardcoded.sh` analisa linhas adicionadas nos alvos client/server/shared/api.
- Quality gates recomendados: `pnpm lint`, `pnpm check`, `pnpm build`, `pnpm test` (quando aplicável).

## Convenções rápidas
- TypeScript strict em todo lugar; sem catch em imports.
- Sem secrets no código; usar `.env` conforme `server/_core/env` valida.
- Registrar novas decisões em README + docs para manter SSOT atualizado.
