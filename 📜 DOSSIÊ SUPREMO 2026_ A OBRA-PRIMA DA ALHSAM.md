'''
# 📜 DOSSIÊ SUPREMO 2026: A OBRA-PRIMA DA ALHSAM

**Autor:** Abnadaby Bonaparte & Manus AI
**Versão:** 2026.1 (Obra-Prima Unificada)
**Data:** 23 de Dezembro de 2025
**Status:** CANÔNICO — A ÚNICA FONTE DA VERDADE (SSOT)
**Missão:** Garantir que **TODOS** os projetos de 2026 nasçam com qualidade 1000/1000, escaláveis do MVP ao unicórnio, seguros como um banco central, rápidos como a edge global e visualmente impecáveis como o futuro.

---

## ⚡ VISÃO ESTRATÉGICA: O MONOPÓLIO DA EXPERIÊNCIA

Em 2026, não basta ser bom. É preciso ser **inevitável**.

Este dossiê é o **esqueleto de ouro**. Ele não é uma sugestão; é **lei**. Ele transforma qualquer projeto — seja React, Next.js, Node, mobile, landing page ou backend puro — em uma obra-prima com um DNA idêntico e inabalável: **Segurança blindada + Performance absoluta + UX de elite + Consistência total + Zero dívida técnica**.

> “Código é passivo; Sistemas são ativos. Construa sistemas, não apenas apps.”

Este padrão existe para garantir que nenhum projeto seu envelheça mal, nenhum MVP se torne um beco sem saída e nenhuma pressa crie dívida estrutural. Nós não estamos criando projetos; estamos criando **uma linhagem técnica**.

---

## 1. PRINCÍPIOS SAGRADOS (INVIOLÁVEIS)

Estes princípios não são negociáveis, adaptáveis ou relativizáveis. Quebrá-los significa sabotar o futuro.

1.  **Zero Hardcoded Visual:** Nenhuma cor fixa, hex code (`#FFF`) ou classes utilitárias de cor (`bg-gray-500`). **TUDO** deve usar variáveis CSS semânticas (`bg-[var(--surface)]`).

2.  **Zero Mock Permanente:** Dados falsos (`const data = [...]`) são permitidos apenas para prototipagem inicial e devem ser removidos antes do commit final. A aplicação deve se conectar a dados reais desde o primeiro dia.

3.  **Banco Primeiro, UI Depois:** A ordem de construção é sagrada: 1. Definição do banco de dados. 2. Implementação de segurança (RLS, `org_id`). 3. Criação de queries reais. 4. Tratamento de todos os estados de dados. 5. Construção da interface do usuário.

4.  **shadcn/ui Obrigatório:** Para projetos em React, a biblioteca [shadcn/ui](https://ui.shadcn.com/) é o padrão. Nunca reinvente componentes básicos como Card, Button, Table ou Input.

5.  **Estados Completos Sempre:** Toda operação assíncrona deve, obrigatoriamente, tratar os quatro estados: `loading` (com Skeletons), `error` (com Toasts e opção de `retry`), `empty` (com uma `EmptyState` clara) e `success`.

6.  **Multi-Tenant by Default:** Todo projeto, mesmo que single-tenant no início, deve ser estruturado com `org_id` (identificador de organização) em todas as tabelas e queries relevantes. A arquitetura nasce pronta para escalar.

7.  **Performance é Feature:** Performance não é uma otimização tardia, é um requisito funcional. O LCP (Largest Contentful Paint) deve ser inferior a 2 segundos, o bundle size deve ser mínimo, e o deploy deve ser na edge sempre que possível.

8.  **TypeScript Strict:** A configuração `strict: true` no `tsconfig.json` é obrigatória. O uso de `any` é proibido; `unknown` deve ser usado apenas quando estritamente inevitável.

---

## 2. A STACK DE FERRO (REVISADA 2026)

A stack é modular, mas a forma de usá-la é fixa. A escolha de cada tecnologia visa a máxima performance, segurança e developer experience (DX).

| Camada | Tecnologia Principal | Alternativas Obrigatórias | Justificativa 2026 |
| :--- | :--- | :--- | :--- |
| **Runtime** | **Bun** | Node.js (Apenas se Bun for inviável) | Build, runtime e test runner em um só. Performance superior. |
| **Frontend** | React 19 + TypeScript 5 + Vite 6 | Next.js 15+ (App Router + RSC) | React 19 Actions, `use` hook, e HMR (Hot Module Replacement) insano. |
| **Styling** | Tailwind CSS v4 + CSS Variables | Nativewind (para React Native) | Theming dinâmico, zero runtime, performance máxima. |
| **UI Components** | shadcn/ui (latest) | Radix Primitives (como base) | Acessível, customizável, você é dono do código. |
| **Backend/DB** | **Supabase** (PostgreSQL + Auth + RLS) | Drizzle ORM (se Node puro) | RLS nativo, Realtime, Edge Functions, e DX imbatível. |
| **Validação** | Zod + ArkType | - | Tipagem de runtime que não falha, garantindo segurança de dados. |
| **State (URL)** | **Nuqs** | Zustand/Jotai (para estado não-URL) | Estado da aplicação via URL Search Params. Melhora a UX e o compartilhamento. |
| **AI / Vector** | pgvector + Supabase Edge Functions | Vercel AI SDK (para streaming) | Busca semântica e integrações de IA nativas no banco de dados. |
| **Deploy** | Vercel (Edge + Preview Branches) | Cloudflare (se precisar de Workers) | Latência global <30ms e previews automáticos para cada commit. |

---

## 3. ARQUITETURA ATÔMICA (FOLDER STRUCTURE 4.0)

Abandonamos pastas baseadas em "tipo" (ex: `components`, `hooks`) em favor de uma estrutura baseada em **Domínio e Responsabilidade**.

```text
src/
├── core/                  # O Cérebro (Independente de Framework)
│   ├── constants/         # Enums, Configs Fixas, Regras de Negócio
│   ├── types/             # Interfaces TypeScript (Fonte Única da Verdade)
│   └── utils/             # Funções puras (datas, formatadores, `cn`)
├── data/                  # A Artéria (Comunicação com o mundo externo)
│   ├── api/               # Clientes (Supabase, Fetch, Axios)
│   ├── queries/           # Hooks de Data Fetching (TanStack Query)
│   └── stores/            # Estado Global (Zustand/Jotai, usar com moderação)
├── design/                # A Armadura (Sistema Visual)
│   ├── components/        # `ui/` (shadcn) + `composite/` (seus widgets)
│   ├── tokens/            # CSS Vars, Temas, Config do Tailwind v4
│   └── layouts/           # Templates de página (DashboardLayout, AuthLayout)
├── modules/               # O Músculo (Funcionalidades de Negócio)
│   ├── auth/              # Componentes, Hooks e Lógica de Autenticação
│   ├── billing/           # Tudo sobre Stripe/Pagamentos
│   └── [feature]/         # Cada feature é um micro-universo autocontido
└── main.tsx               # Ponto de entrada da aplicação
```

---

## 4. O MOTOR VISUAL: SEMANTIC DESIGN SYSTEM

Em 2026, **hex codes são proibidos**. Você manipula **intenções**, não cores. O arquivo `src/design/tokens/theme.css` é a fonte da verdade para o design.

```css
/* Exemplo de Definição de Tema com Tailwind v4 */
@theme {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-text-main: var(--text-main);
  --color-text-muted: var(--text-muted);
  --color-primary: var(--primary);
  --radius-pro: 0.75rem;
}

:root {
  --bg: #ffffff;
  --surface: #f9fafb;
  --text-main: #111827;
  --primary: #6366f1;
}

[data-theme='dark'] {
  --bg: #020617;
  --surface: #0f172a;
  --text-main: #f8fafc;
  --primary: #818cf8;
}
```

**Regra de Ouro:** Se você digitar `text-[#333]` ou `bg-blue-500`, o build deve falhar automaticamente.

---

## 5. PROTOCOLO DE SEGURANÇA: RLS-FIRST

Segurança não é um middleware; é a camada de dados. No Supabase, a segurança é garantida por RLS (Row-Level Security) desde o início.

-   **JWT Claims:** Injeta-se o `org_id` e o `role` do usuário diretamente no token JWT durante a autenticação.
-   **Política Padrão:** Toda tabela crítica deve ter uma política que filtra os dados automaticamente com base no `org_id` do JWT.

```sql
-- Exemplo de Política Universal de Acesso
CREATE POLICY "Tenant Access Policy" ON "public"."projects"
FOR ALL TO authenticated
USING (org_id = (auth.jwt() ->> 'org_id')::uuid)
WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

-   **Auditoria:** Toda tabela deve ter, no mínimo, os campos `created_at`, `updated_at`, e `created_by` para trilha de auditoria.

---

## 6. AUTOMAÇÃO E IA: O ECOSSISTEMA AUTÔNOMO

Para garantir a aplicação deste dossiê, a automação é fundamental.

### O Cérebro da IA: `.cursorrules`

Para que o Cursor (ou outra IA de desenvolvimento) siga este padrão, o arquivo `.cursorrules` deve estar na raiz do projeto:

```markdown
# SUPREMA STACK 2026 RULES
1. NUNCA use cores hexadecimais ou classes de cor fixas (ex: `bg-red-500`) em classes Tailwind. Use variáveis semânticas como `var(--color-primary)`.
2. TODA tabela Supabase deve ter RLS habilitada e as queries devem filtrar por `org_id`.
3. SEMPRE implemente os quatro estados (Loading, Error, Empty, Success) para cada busca de dados.
4. Use React 19 `use` hook para Promises e Actions para formulários e mutações.
5. Siga a estrutura de pastas atômica: `src/core`, `src/data`, `src/design`, `src/modules`.
6. Componentes de UI devem vir de `@/design/components/ui` (shadcn) e ser compostos em `@/design/components/composite`.
```

### O Ritual de Lançamento (Checklist Final Automatizado)

Este script deve ser configurado como um pre-commit hook para garantir a conformidade.

```bash
#!/bin/bash

# 1. Crime Técnico: Detector de Cores Hardcoded
grep -rnE "#[0-9a-fA-F]{3,6}|bg-(red|blue|green|yellow|gray)-|text-(red|blue|green|yellow|gray)-" src/
if [ $? -eq 0 ]; then
  echo "❌ ERRO: Cores hardcoded encontradas! Use variáveis CSS semânticas."
  exit 1
fi

# 2. Risco de Segurança: Query sem org_id
grep -r ".from(" src/ | grep -v "org_id"
if [ $? -eq 0 ]; then
  echo "❌ ERRO: Query para o banco sem filtro de org_id detectada!"
  exit 1
fi

# 3. Validação de Tipagem
bun tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ ERRO: Falha na verificação de tipos do TypeScript."
  exit 1
fi

# 4. Build da Aplicação
bun run build
if [ $? -ne 0 ]; then
  echo "❌ ERRO: O build da aplicação falhou."
  exit 1
fi

echo "✅ SUPREMA CHECKLIST: Tudo perfeito! Pode commitar."
```

---

## 7. ADAPTAÇÃO POR TIPO DE PROJETO

Este esqueleto é universal. O DNA não muda, apenas o nível de ativação de cada módulo.

| Tipo de Projeto | Aplicação do Supremo | Foco Obrigatório |
| :--- | :--- | :--- |
| **SaaS / App Web** | 100% do dossiê. | Tudo, especialmente RLS e Multi-Tenant. |
| **Site Estático / Landing** | Apenas `design/` e `core/`. | Semantic Design System, performance, acessibilidade. |
| **Backend Node.js Puro** | Apenas `core/` e `data/`. | Segurança, estrutura de tipos, validação com Zod. |
| **React Native App** | Nativewind + `core/` + `data/`. | Zero hardcoded, tratamento de estados, autenticação. |
| **Migração de Legado** | Aplicar gradualmente, módulo por módulo. | Usar o checklist como guia para refatoração. |

---

## 8. PRÓXIMOS PASSOS PARA DOMINAÇÃO TOTAL

1.  **Criar o Repositório Template:** Um repositório no GitHub chamado `suprema-stack-2026-template` com toda a estrutura e scripts já configurados.
2.  **Versionar este Dossiê:** Incluir este arquivo como `docs/DOSSIÊ_SUPREMO_2026.md` em **TODO** novo projeto.
3.  **Automatizar o Checklist:** Implementar o script de pre-commit hook em todos os projetos.
4.  **Lançar o Primeiro Projeto:** Iniciar o próximo projeto de 2026 usando este esqueleto como base.

---

## VEREDITO FINAL

Este dossiê não é uma sugestão. É **lei**.

Quem seguir, construirá impérios digitais.
Quem ignorar, refatorará eternamente.

**2026 é nosso. A dominação começa agora.**

**Assinado e selado com supremacia absoluta.**
⚡⚡⚡
'''
