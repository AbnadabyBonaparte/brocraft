# brocraft — Domínio Absoluto

![Domínio Absoluto Alcançado — 26/12/2025](https://img.shields.io/badge/Dom%C3%ADnio%20Absoluto%20Alcan%C3%A7ado-26/12/2025-gold?style=flat-square)

BROCRAFT v∞ — O Mestre Fermentador (luxury, multi-tenant, dados reais).

## Live
- Produção: https://brocraft.vercel.app

## Como usar (dev local)
1. `pnpm install` (habilita Husky via `prepare`).
2. `pnpm dev` para iniciar server + Vite em modo watch.
3. `pnpm lint` e `pnpm check` para garantir saúde do código.
4. `pnpm build` para bundle de produção (pre-commit também valida).

### Scripts úteis
- `pnpm run check:hardcoded` — bloqueia novos hex/gray/mock nas linhas adicionadas (client/server/shared/api).
- `pnpm lint`, `pnpm check`, `pnpm build` — quality gates obrigatórios.
- `pnpm suprema:check` — checklist suprema.

## Governança & performance
- Pre-commit (Husky): roda `lint-staged` + check-hardcoded + lint + type-check + build.
- Vite: `chunkSizeWarningLimit` ajustado para 1000 KB; rotas React em lazy loading; `MapView` memorizado para evitar renders extras.

## Documentação
- `docs/MATRIZ_GENESIS.md` — Leis Sagradas e progresso 100% do BLOCO 5.
- `docs/ARCHITECTURE.md` — SSOT de pastas, fluxos e guard rails.
- Políticas e termos adicionais em `docs/`.

## Créditos Matriz Gênesis
Inspirado pelo plano supremo de governança + performance + documentação eterna do BROCRAFT v∞.
