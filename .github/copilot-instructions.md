# GitHub Copilot — BROCRAFT

## Regras de estilo e arquitetura

1. **Cores (Lei 1 ALSHAM)**  
   Não use cores hardcoded. Use apenas tokens de tema:
   - `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`
   - `bg-primary`, `text-primary-foreground`, `bg-destructive`, `text-destructive-foreground`
   - Evite: `bg-gray-*`, `text-white`, `text-gray-*`, hex em className/style.

2. **UI**  
   Use componentes de `@/components/ui/*` (shadcn). Não crie divs/buttons genéricos para padrões já cobertos.

3. **Dados**  
   Dados vêm de tRPC e Drizzle. Não use mock, fake ou dummy em dados.

4. **Estados**  
   Sempre trate loading, erro e empty (Skeleton, mensagem, retry).

5. **Estrutura**  
   - Frontend: `client/src/` (pages, components, contexts, hooks, lib).
   - Backend: `server/` (_core, routers.ts, db.ts).
   - Compartilhado: `shared/`. Schema: `drizzle/schema.ts`.

Consulte `CLAUDE.md` e `docs/ARCHITECTURE.md` para mais detalhes.
