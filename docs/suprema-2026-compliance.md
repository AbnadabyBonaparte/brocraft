# Suprema 2026 – snapshot de aderência

## Como medi
Usei 6 critérios práticos alinhados ao dossiê (peso igual) e atribuí 0/50/100 por critério conforme evidências no código atual.

| Critério | Evidências do estado atual | Aderência |
| --- | --- | --- |
| Stack base (Next 14+, App Router, Supabase) | Frontend roda em Vite/React 19 (`pnpm build` → `vite build`) e roteamento com Wouter; backend é Express em Node; banco via Drizzle/MySQL, sem Supabase. | 30% |
| Multitenancy com `org_id` + RLS-first | Schemas e queries usam apenas `userId` (ex.: mensagens, XP) e o cliente MySQL não expõe `org_id`; não há RLS. | 0% |
| Design system e tokens semânticos (Tailwind v4 + shadcn/ui) | Biblioteca de componentes shadcn-like com Tailwind v4 e variáveis `primary`, `secondary` etc.; não há varredura de cores fixas nem tokenização semântica rígida. | 60% |
| Fluxo de dados resiliente (4 estados, React Query) | React Query está instalado e usado em páginas críticas, mas não há evidência de padronização para loading/empty/error/success em todos os módulos. | 50% |
| Governança de código seguro (lint/tsc/build + detecção de cores/org) | Scripts cobrem `lint`, `tsc --noEmit`, `vitest run`, mas não existem checagens automáticas de cores hardcoded ou `org_id`. | 50% |
| Observabilidade e segurança (auth + policies nomeadas) | Express exposto sem autenticação/autorizações RLS; não há políticas declarativas nem captura mínima de auditoria além de logs de console. | 20% |

## Resultado
**Aderência estimada: ~35%** (média simples dos critérios). O principal gap é multi-tenant/RLS e alinhamento de stack para Supabase/Next.

## Recomendações rápidas
1) Priorizar migração de dados para modelo multi-tenant com `org_id` em todas as tabelas/queries e enforcement via políticas (Supabase/RLS).
2) Adicionar checklist automatizado (cores hardcoded, presença de `org_id`, `bun tsc`/build) antes dos commits/CI.
3) Formalizar o design system com tokens semânticos e bloqueio de cores fixas no build.

## Checklist automatizado disponível
- **Script:** `pnpm suprema:check` (modo permissivo) ou `pnpm suprema:check:strict` (falha se houver cores hex ou ausência de `org_id`).
- **O que cobre:** lint (`pnpm lint`), tipagem (`pnpm check`), testes (`pnpm test`), varredura de cores hex em `client/`, `server/`, `shared/`, `api/`, e alerta de ausência de `org_id` nas camadas de backend.
- **Modo de adoção sugerido:** rodar em pre-commit/CI em modo permissivo para mapear débitos atuais; habilitar o modo strict após tratar cores e modelar `org_id` para multi-tenancy.
