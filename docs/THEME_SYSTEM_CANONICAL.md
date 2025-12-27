# BROCRAFT v∞ — Theme System Canonical (SSOT) v1.0

## 1. Objective
- Eliminar hardcoded: todas as cores vivem em variáveis CSS e tokens Tailwind derivados delas.
- Tema dinâmico: alternância light/dark via `ThemeContext` e `data-theme`, persistido em `localStorage` quando habilitado.
- Luxury eterno: paleta ouro soberano + obsidian + marble como fonte única da identidade visual.

## 2. Core Principle (SSOT em `theme.css`)
- `client/src/styles/theme.css` é a fonte única das variáveis de cor (`--theme-*`).
- Nada de hex direto em componentes: use tokens Tailwind mapeados para `var(--color-*)`, que por sua vez apontam para `--theme-*`.
- Novas cores entram primeiro em `theme.css`, depois são expostas no `@theme inline` de `client/src/index.css`.

## 3. Paleta Luxury Oficial
| Nome | Hex (dark) | Uso | Fonte |
| --- | --- | --- | --- |
| Ouro Soberano (Primary) | `#D4AF37` | Ações principais, acentos, ícones premium | `--theme-primary` |
| Ouro Soberano Borda | `rgba(212, 175, 55, 0.25)` | Bordas, divisórias discretas | `--theme-border` |
| Ouro Soberano Ring | `rgba(212, 175, 55, 0.55)` | Foco, realces de inputs | `--theme-ring` |
| Obsidian | `#050505` | Fundo absoluto | `--theme-background` |
| Marble Onyx | `#111111` | Superfícies fortes (cards/modais) | `--theme-surface-strong` |
| Marble Neutro | `#0B0B0B` | Superfícies padrão | `--theme-surface` |
| Marble Veludo | `#0D0D0D` | Superfícies suaves / áreas secundárias | `--theme-surface-muted` |
| Texto Lux | `#F5F5F5` | Texto principal | `--theme-text-primary` |
| Texto Suave | `#A0A0A0` | Texto secundário | `--theme-text-secondary` |
| Acento Champagne | `#F1DFA3` | Destaques, bordas suaves | `--theme-accent` |
| Acento Foreground | `#050505` | Texto em acento | `--theme-accent-foreground` |
| Escala Marble/Obsidian | `#F4F3EF` → `#0C0B08` | Gradiente de neutros para backgrounds e tipografia | `--theme-gray-50..950` |
| Ambers Lux | `#F1B86B` → `#8E4319` | Charts, alertas brandizados | `--theme-amber-300..700` |
| Rose Royale | `#D5655B` → `#A63B32` | Estados destrutivos premium | `--theme-rose-400..600` |
| Royal Amethyst | `#C6B4FF` → `#8F6ED5` | Grafismos, badges | `--theme-royal-400..600` |
| Ice Quartz | `#B5DFFF` → `#65AEE6` | Dados frios, tooltips | `--theme-ice-300..500` |
| Success Verdant | `#8FD19E` → `#6FB885` | Sucesso/validado | `--theme-success-400..500` |

## 4. CSS Variables Hierarchy
```css
:root {
  /* SSOT: dark luxury */
  --theme-background: #050505;
  --theme-surface: #0b0b0b;
  --theme-surface-strong: #111111;
  --theme-text-primary: #f5f5f5;
  --theme-primary: #d4af37;
  /* ...demais --theme-* ... */
}

[data-theme="light"] {
  /* Deriva a paleta clara sem hardcodes em componentes */
  --theme-background: #f8f6ef;
  --theme-surface: #ffffff;
  --theme-text-primary: #1a1a15;
  --theme-primary: #c08d2c;
  /* ...demais --theme-* com variantes light ... */
}
```
- Hierarquia: `--theme-*` (SSOT) → `--color-*` (expostos ao Tailwind) → utilitários Tailwind em componentes.

## 5. Tailwind Mapping (tokens → vars)
- `client/src/index.css` define `@theme inline` com o mapeamento oficial:
  - `--color-background`, `--color-foreground`, `--color-card`, `--color-popover`, `--color-sidebar*` → superfícies `--theme-*`.
  - `--color-primary`, `--color-accent`, `--color-destructive` → brand/rose.
  - Paletas utilitárias: `--color-gray-*` ← `--theme-gray-*`; `--color-orange-*` ← `--theme-amber-*`; `--color-red-*` ← `--theme-rose-*`; `--color-purple-*`/`--color-pink-*` ← `--theme-royal-*`; `--color-blue-*` ← `--theme-ice-*`; `--color-green-*` ← `--theme-success-*`.
- Em Tailwind, use apenas tokens (ex.: `bg-background`, `text-primary`, `border-border`). Nada de hex direto.

## 6. Toggle Implementation (ThemeContext + localStorage)
- `client/src/contexts/ThemeContext.tsx`:
  - `ThemeProvider` aplica `data-theme` e classe `.dark` no `documentElement`.
  - Persistência opcional: quando `switchable=true`, salva preferência em `localStorage` (`theme`).
  - `toggleTheme` alterna entre light/dark quando o provider for declarado como `switchable`.
- Uso: envolver a árvore de UI com `<ThemeProvider switchable defaultTheme="dark">` para lux dark por padrão com toggle habilitado.

## 7. Governance (safelist, guards pré-commit)
- Husky + lint-staged rodam Prettier em `*.{ts,tsx,js,jsx,json,css,md}`.
- Script de guard anti-hardcode: `pnpm check:hardcoded` (`scripts/check-hardcoded.sh`).
- Checklist SUPREMA: `pnpm suprema:check` (ou `suprema:check:strict`) assegura conformidade visual e de governança.
- Regra: qualquer nova cor deve ser declarada em `theme.css` e exposta no `@theme inline`; PRs sem isso não entram.

## 8. Future Themes (light/custom)
- Para novo tema:
  1. Adicione bloco `[data-theme="new"]` em `client/src/styles/theme.css` com TODO o conjunto `--theme-*`.
  2. Mapas Tailwind continuam iguais (herdam `--color-*` do `@theme inline`).
  3. Exponha o tema no `ThemeProvider` (ex.: `defaultTheme="new"`) e ajuste toggles conforme necessário.
- Sempre mantenha paridade de variáveis entre temas para evitar tokens órfãos.
