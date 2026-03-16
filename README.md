# BROCRAFT

Assistente de IA gamificado para fermentação e artesanato alimentar.

> Cerveja, queijos, fermentados, destilados — aprenda com IA, suba de nível, desbloqueie receitas.

---

## Stack

React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4 · tRPC · Drizzle ORM · MySQL · Express · Vercel

## Início Rápido

```bash
pnpm install
pnpm dev          # Frontend + Backend
pnpm build        # Build para produção
pnpm test         # Vitest
pnpm lint         # ESLint
```

## Estrutura

```
client/src/
├── pages/           # Páginas (Home, Recipes, Badges, Community, Chat...)
├── components/
│   ├── ui/          # shadcn/Radix (53+ componentes)
│   └── ...          # ChatBox, ProfileCard, PricingSection, etc.
├── contexts/        # ThemeContext, AuthContext
├── hooks/           # Custom hooks
├── lib/             # Utilitários
└── styles/          # theme.css (SSOT de cores)

server/
├── _core/           # LLM, auth, middleware
└── routers/         # tRPC routers

shared/              # Constantes, rotas, tipos
drizzle/             # Schema + migrations (MySQL)
```

## Features

- 🤖 Chat com IA especializada em fermentação
- 🎮 Gamificação: XP, ranks (NOVATO → LEGEND), badges, streak
- 🍺 Receitas por nível (cerveja, queijo, fermentado, destilado)
- 👥 Comunidade com posts e leaderboard
- 💳 Planos: Free, Mestre, Clube Bro (Stripe)
- 🌙 Dark/Light mode

## Design System

- Cores: CSS variables em `client/src/styles/theme.css`
- Fontes: definidas no tema
- Dark/Light mode via ThemeContext

---

ALSHAM Global Commerce Ltda. · 2026
