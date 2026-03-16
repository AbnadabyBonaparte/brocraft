# AUDITORIA FORENSE ALSHAM — BROCRAFT v∞

> Gerada em: 2026-03-16 | Branch: claude/fix-vercel-dist-deploy-y0Hwz

---

## Scorecard Geral

| Dimensão             | Nota (0-10) | Observações                                                                                                                                                                                                |
| -------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arquitetura          | 8/10        | Separação clara client/server/shared, tRPC + Drizzle + Express, SSOT em drizzle/schema.ts. Ponto de melhoria: api/ na raiz duplica lógica do server/                                                       |
| Estilização / Design | 6/10        | Tema via CSS vars implementado. Dark/light switchable funcional. 5 violações residuais em shadcn/ui base (bg-black/50 em overlays — aceitáveis). 2 violações em app components corrigidas nesta auditoria. |
| Dados & Backend      | 7/10        | tRPC + Drizzle sem mock data. MySQL via mysql2. Validação de env ao startup. Stripe + OAuth estruturados.                                                                                                  |
| IA / Gamificação     | 7/10        | OpenAI via tRPC. XP/ranks/badges. Chat com streaming (streamdown). PWA.                                                                                                                                    |
| Segurança            | 7/10        | Headers de segurança, rate limiting, Sentry, validação de env. CORS genérico (`*`) em produção é vulnerabilidade.                                                                                          |
| Performance          | 7/10        | Vite + Workbox + cache de fonts/API. KaTeX no bundle (+1MB em assets).                                                                                                                                     |
| Testes               | 7/10        | 40 testes passando, 2 skipped. Smoke tests para componentes críticos. Sem testes E2E.                                                                                                                      |
| Documentação         | 8/10        | CLAUDE.md, README.md, docs/ARCHITECTURE.md, docs/THEME_SYSTEM_CANONICAL.md. Bem estruturado.                                                                                                               |
| Governança AI        | 7/10        | CLAUDE.md com 6 regras claras. CI no GitHub Actions. Husky + lint-staged. Sem .cursorrules.                                                                                                                |
| Deploy & CI/CD       | 5/10        | CI existe. **Deploy quebrado** por `framework: "vite"` no vercel.json (introduzido pelo Cursor). Corrigido nesta auditoria.                                                                                |
| **MÉDIA**            | **6.9/10**  | **Deploy estava crítico; demais dimensões sólidas para a fase atual**                                                                                                                                      |

---

## Detalhamento por Lei ALSHAM

### Lei 1 — Zero cores hardcoded

**Nota: 6.5/10**

Violações encontradas (pré-auditoria):

- `bg-white` em `ChatBox.tsx:297` ✅ CORRIGIDA → `bg-card border-border`
- `bg-blue-500/10` + `border-blue-500/30` + `text-blue-300` em `RecipeLevelModal.tsx:177` ✅ CORRIGIDA → `bg-primary/10 border-primary/30 text-muted-foreground`

Violações residuais (shadcn/ui base — não modificar por regra ALSHAM):

- `bg-black/50` em 4 overlays (drawer, dialog, alert-dialog, sheet) — padrão de modal; aceitável
- `bg-white` em `slider.tsx` — componente base shadcn/ui

Hardcoded hex: 0 instâncias ✅

### Lei 2 — Componentes UI padronizados

**Nota: 8/10**

Uso consistente de shadcn/ui: Card, Button, Input, Select, Dialog, Skeleton, Tabs, etc. Sem componentes custom duplicando padrões existentes.

### Lei 3 — Dados 100% reais

**Nota: 8/10**

Nenhum mock/fake/placeholder em componentes de produção. Dados via tRPC + Drizzle.

### Lei 4 — Temas dinâmicos

**Nota: 8/10**

`ThemeProvider` com `switchable` ativo em App.tsx. `[data-theme="dark"]` em theme.css. `next-themes` usado apenas em sonner.tsx (correto para toast theming).

### Lei 5 — Estados UI completos

**Nota: 7/10**

Skeleton e loading states nos componentes principais. Alguns componentes carecem de estado de erro explícito (páginas Recipes, Community).

### Lei 6 — Estrutura canônica

**Nota: 8/10**

- `client/src/` → frontend ✅
- `server/` + `api/` → backend (api/index.ts re-exporta server/ para Vercel serverless — aceitável)
- `shared/` → tipos compartilhados ✅
- `drizzle/` → schema + migrations ✅

---

## Root Cause do Deploy Quebrado

### Cronologia

1. Estado original: `framework: null` + rewrite `/:path*` → deploy funcional mas 404 em rotas SPA
2. Cursor commit `d714726`: mudou para `framework: "vite"` + rewrite `/(.*)`
3. **Bug introduzido:** Vercel com `framework: "vite"` resolve `outputDirectory: "dist"` relativo ao Vite root (`client/`), buscando `client/dist/`. O build gera em `dist/` na raiz do projeto (via `outDir: path.resolve(import.meta.dirname, "dist")`). → **"No Output Directory named 'dist' found"**

### A correção REAL do 404 era o rewrite

- `/:path*` não captura a rota raiz `/`
- `/(.*)` captura qualquer rota incluindo `/`
- Mudança de rewrite: **correta**. Mudança de framework: **erro**.

### Fix aplicado

- `"framework": "vite"` → `"framework": null`
- Rewrite `/(.*)` mantido

---

## Manus Artifacts

**Status: LIMPO ✅** — Nenhum resquício de ManusDialog, `__manus__/`, ou `vite-plugin-manus-runtime`.

---

## Próximos Passos Recomendados

1. **CORS:** Substituir `Access-Control-Allow-Origin: *` por domínio específico em produção
2. **Testes E2E:** Adicionar Playwright para fluxos críticos (auth, chat, upgrade)
3. **Error states:** Revisar páginas Recipes e Community para estados de erro explícitos
4. **slider.tsx:** Aguardar atualização shadcn/ui com suporte a `bg-background` no thumb

---

_Auditoria conduzida por Claude Code — Sonnet 4.6 | ALSHAM Standards v1.0_
