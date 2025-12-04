# 🔥 BROCRAFT v∞ - DOSSIER COMPLETO & CHECKLIST MASTER

**Data:** Dezembro 2025  
**Status:** MVP Funcional (15% Completo)  
**Objetivo:** Transformar em #1 Plataforma de Fermentação do Brasil

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura Técnica](#arquitetura-técnica)
3. [Checklist Completo](#checklist-completo)
4. [Roadmap Detalhado](#roadmap-detalhado)
5. [Modelo de Negócio](#modelo-de-negócio)
6. [Estratégia de SEO](#estratégia-de-seo)
7. [Plano de Lançamento](#plano-de-lançamento)

---

## 🎯 VISÃO GERAL

### O que é BROCRAFT?

**BROCRAFT v∞** é uma plataforma completa de fermentação caseira que combina:

- **Educação** - Chat IA + Receitas estruturadas
- **Comunidade** - Feed de posts/vídeos com ranking
- **Marketplace** - Venda de insumos (fermento, coalho, equipamentos)
- **Gamificação** - XP, Ranks, Badges, Leaderboard
- **Monetização** - Tiers Premium + Comissão em vendas

### Diferencial

Não é só um app de receitas. É uma **rede social + marketplace + plataforma educacional** focada em fermentação caseira.

**Viral Loop:**
Aprende → Faz → Posta → Vota → Compra → Repete

### Mercado Alvo

- **TAM:** US$ 44.4B → US$ 85.8B até 2030 (fermentação global)
- **SAM:** US$ 2.2B (Brasil + América Latina)
- **SOM:** US$ 100M (Year 1 target)

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Atual (✅ IMPLEMENTADO)

```
Frontend:
- React 19 + Vite
- Tailwind CSS 4
- shadcn/ui components
- Wouter (routing)

Backend:
- Node.js + Express
- tRPC (type-safe APIs)
- Drizzle ORM

Database:
- MySQL/TiDB
- Drizzle migrations

Auth:
- Manus OAuth
- JWT sessions

AI:
- Claude API (LLM)
- Manus Forge API

Storage:
- S3 (Manus)
```

### Tabelas do Banco de Dados (✅ IMPLEMENTADAS)

```
users
├── id (PK)
├── openId (unique)
├── name, email
├── role (admin/user)
├── xpTotal, rank
├── tier (free/mestre/clube_bro)
├── createdAt, updatedAt

messages
├── id (PK)
├── userId (FK)
├── content, response
├── xpGained
├── createdAt

recipes
├── id (PK)
├── title, category
├── levels (rajado/classico/mestre)
├── macete, warnings
├── xpReward
├── createdAt

userRecipes
├── id (PK)
├── userId (FK)
├── recipeId (FK)
├── level, status
├── startedAt, completedAt

badges
├── id (PK)
├── userId (FK)
├── badgeType
├── earnedAt

communityPosts (❌ SCHEMA PRONTO, FALTA UI)
├── id (PK)
├── userId (FK)
├── content, imageUrl, videoUrl
├── category (cerveja/fermentado/queijo/charcutaria)
├── votes, comments
├── createdAt

votes (❌ SCHEMA PRONTO, FALTA UI)
├── id (PK)
├── postId (FK)
├── userId (FK)
├── voteType (like/love/fire)

products (❌ SCHEMA PRONTO, FALTA UI)
├── id (PK)
├── name, description
├── price, stock
├── category (fermento/coalho/lupulo/equipamento)
├── imageUrl
├── createdAt

cartItems (❌ SCHEMA PRONTO, FALTA UI)
├── id (PK)
├── userId (FK)
├── productId (FK)
├── quantity

orders (❌ SCHEMA PRONTO, FALTA UI)
├── id (PK)
├── userId (FK)
├── totalPrice, status
├── stripePaymentId
├── createdAt

conversationHistory (✅ IMPLEMENTADO)
├── id (PK)
├── userId (FK)
├── title, messages
├── messageCount, xpGained
├── createdAt
```

---

## ✅ CHECKLIST COMPLETO (72 ITENS)

### FASE 1: ARQUITETURA & SETUP (✅ 100% CONCLUÍDO)

- [x] Inicializar projeto Next.js com T3 Stack
- [x] Configurar Drizzle ORM com MySQL
- [x] Implementar Manus OAuth
- [x] Configurar variáveis de ambiente
- [x] Integrar Manus Forge API (LLM)
- [x] Criar schema com 5 tabelas base

### FASE 2: BACKEND - CHAT & GAMIFICAÇÃO (✅ 100% CONCLUÍDO)

- [x] Implementar tRPC router para chat
- [x] Integrar Claude API para respostas IA
- [x] Implementar sistema de XP e Ranks
- [x] Implementar sistema de Badges
- [x] Criar query helpers para banco de dados
- [x] Implementar histórico de conversas

### FASE 3: FRONTEND - UI/UX (✅ 80% CONCLUÍDO)

- [x] Criar layout principal com sidebar
- [x] Implementar chat com streaming
- [x] Criar componentes de Rank e XP
- [x] Implementar página de Receitas
- [x] Criar dashboard de perfil
- [x] Implementar responsividade mobile
- [ ] Adicionar animações avançadas (Framer Motion)
- [ ] Criar página de Histórico de Conversas (UI)

### FASE 4: COMUNIDADE (❌ 0% - CRÍTICO)

- [ ] Criar schema para communityPosts
- [ ] Implementar tRPC router para posts
- [ ] Criar componente de Feed de Posts
- [ ] Implementar upload de imagens/vídeos
- [ ] Criar componente de Modal para novo post
- [ ] Implementar sistema de likes/comentários
- [ ] Integração com Instagram/TikTok (share button)
- [ ] Criar galeria de posts com redirecionamento
- [ ] Implementar filtros por categoria
- [ ] Adicionar notificações de novo post

### FASE 5: RANKING & VOTAÇÃO (❌ 0% - CRÍTICO)

- [ ] Criar schema para votes
- [ ] Implementar tRPC router para votação
- [ ] Criar componente de Leaderboard
- [ ] Implementar ranking por categoria:
  - [ ] Melhor Queijo do Mês
  - [ ] Melhor IPA Compartilhada
  - [ ] Melhor Fermentado
  - [ ] Melhor Charcutaria
  - [ ] Melhor Progresso (Streak, XP)
  - [ ] Melhor Dica/Comentário
  - [ ] Mais Criativo (fotos/vídeos)
- [ ] Criar badges para top 3
- [ ] Implementar sistema de pontos de votação
- [ ] Adicionar animações de rank-up
- [ ] Criar página de Rankings

### FASE 6: MARKETPLACE (❌ 0% - CRÍTICO)

#### Produtos & Catálogo
- [ ] Criar schema para products
- [ ] Implementar tRPC router para produtos
- [ ] Criar componente de Catálogo de Produtos
- [ ] Implementar filtros por categoria:
  - [ ] Fermentos (lactobacillus, saccharomyces)
  - [ ] Coalho para queijo
  - [ ] Lúpulos, maltes, leveduras
  - [ ] Sal fermentado, especiarias
  - [ ] Equipamentos (potes, garrafas, termômetros)
  - [ ] Kits prontos
- [ ] Criar componente de Detalhe do Produto
- [ ] Implementar sistema de reviews/ratings
- [ ] Adicionar imagens de produtos

#### Carrinho & Checkout
- [ ] Criar schema para cartItems
- [ ] Implementar tRPC router para carrinho
- [ ] Criar componente de Carrinho
- [ ] Implementar adicionar/remover do carrinho
- [ ] Criar componente de Checkout
- [ ] Implementar validação de estoque
- [ ] Adicionar cálculo de frete

#### Pagamentos
- [ ] Integrar Stripe
- [ ] Criar webhook para pagamentos
- [ ] Implementar confirmação de pagamento
- [ ] Criar página de sucesso/erro
- [ ] Implementar recibo por email

### FASE 7: MONETIZAÇÃO (❌ 0% - CRÍTICO)

#### Tiers Premium
- [ ] Criar schema para subscriptions
- [ ] Implementar tRPC router para tiers
- [ ] Criar componente de Pricing
- [ ] Implementar upgrade para MESTRE (R$ 9,90/mês)
- [ ] Implementar upgrade para CLUBE_BRO (R$ 19,90/mês)
- [ ] Criar paywall para receitas premium
- [ ] Implementar destaque na comunidade para premium
- [ ] Criar trial de 7 dias
- [ ] Implementar cancelamento de assinatura

#### Comissão de Vendas
- [ ] Implementar cálculo de comissão (20%)
- [ ] Criar dashboard de vendas para lojistas
- [ ] Implementar pagamento de comissão
- [ ] Criar relatório de vendas

### FASE 8: SEGURANÇA & COMPLIANCE (❌ 0%)

- [ ] Implementar avisos de destilação ilegal
- [ ] Adicionar avisos de botulismo
- [ ] Criar Termos de Uso
- [ ] Implementar LGPD compliance
- [ ] Adicionar rate limiting
- [ ] Sanitizar inputs
- [ ] Implementar HTTPS
- [ ] Adicionar validação de email
- [ ] Criar política de privacidade
- [ ] Implementar 2FA (opcional)

### FASE 9: SEO & MARKETING (❌ 0%)

#### SEO Técnico
- [ ] Implementar meta tags dinâmicas
- [ ] Adicionar schema.org markup
- [ ] Criar sitemap.xml
- [ ] Criar robots.txt
- [ ] Implementar Open Graph tags
- [ ] Adicionar canonical tags
- [ ] Implementar structured data (JSON-LD)
- [ ] Otimizar Core Web Vitals
- [ ] Implementar lazy loading de imagens
- [ ] Adicionar breadcrumbs

#### Conteúdo SEO
- [ ] Criar blog/FAQ section
- [ ] Gerar 50 artigos sobre fermentação
- [ ] Otimizar para palavras-chave de cauda longa
- [ ] Criar guias de receitas (long-form)
- [ ] Implementar internal linking
- [ ] Criar landing page de vendas

#### Analytics & Tracking
- [ ] Integrar Google Analytics 4
- [ ] Implementar Sentry para error tracking
- [ ] Adicionar LogRocket para session replay
- [ ] Criar dashboard de métricas
- [ ] Implementar event tracking
- [ ] Adicionar heatmap (Hotjar)

### FASE 10: EMAIL & NOTIFICAÇÕES (❌ 0%)

- [ ] Integrar SendGrid/Mailchimp
- [ ] Criar email de boas-vindas
- [ ] Implementar email de confirmação
- [ ] Criar email de recuperação de senha
- [ ] Implementar notificações push
- [ ] Criar email de novo post na comunidade
- [ ] Implementar email de ranking atualizado
- [ ] Criar email de promoção de produtos
- [ ] Adicionar email de reengajamento

### FASE 11: SEED DE RECEITAS (❌ 0%)

- [ ] Criar 15 receitas de cerveja
- [ ] Criar 15 receitas de fermentados
- [ ] Criar 10 receitas de queijos
- [ ] Criar 10 receitas de charcutaria
- [ ] Validar estrutura JSON
- [ ] Executar script de seed
- [ ] Testar visualização de receitas

### FASE 12: TESTES & QA (❌ 0%)

#### Testes Unitários
- [ ] Testar tRPC routers
- [ ] Testar query helpers
- [ ] Testar componentes React
- [ ] Testar autenticação
- [ ] Testar pagamentos (Stripe)

#### Testes de Integração
- [ ] Testar fluxo completo de chat
- [ ] Testar fluxo de compra
- [ ] Testar compartilhamento em redes sociais
- [ ] Testar votação e ranking

#### Testes de Performance
- [ ] Testar carga com 1000+ usuários
- [ ] Otimizar queries do banco
- [ ] Implementar caching
- [ ] Testar CDN

#### Testes de Segurança
- [ ] Testar SQL injection
- [ ] Testar XSS
- [ ] Testar CSRF
- [ ] Testar autenticação
- [ ] Testar autorização

### FASE 13: DEPLOY & DEVOPS (❌ 0%)

- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Configurar staging environment
- [ ] Implementar database migrations
- [ ] Configurar backups automáticos
- [ ] Implementar monitoring
- [ ] Configurar alertas
- [ ] Deploy em produção
- [ ] Configurar CDN
- [ ] Implementar rate limiting
- [ ] Configurar SSL/TLS

### FASE 14: BETA & SOFT LAUNCH (❌ 0%)

- [ ] Recrutar 10 beta testers
- [ ] Coletar feedback
- [ ] Corrigir bugs críticos
- [ ] Otimizar UX baseado em feedback
- [ ] Criar comunidade Discord/Slack
- [ ] Implementar feedback form
- [ ] Criar roadmap público
- [ ] Lançar soft launch com 100 usuários

### FASE 15: LANÇAMENTO PÚBLICO (❌ 0%)

- [ ] Criar landing page
- [ ] Preparar assets de marketing
- [ ] Criar vídeo de apresentação
- [ ] Lançar no Product Hunt
- [ ] Postar no Reddit (/r/fermentation, /r/homebrewing)
- [ ] Postar no Twitter/X
- [ ] Criar conteúdo no TikTok/Instagram
- [ ] Fazer outreach com influenciadores
- [ ] Criar press release
- [ ] Lançar campanha de email

### FASE 16: CRESCIMENTO (❌ 0%)

- [ ] Atingir 1.000 usuários
- [ ] Atingir 10.000 usuários
- [ ] Atingir 100.000 usuários
- [ ] Implementar referral program
- [ ] Criar programa de afiliados
- [ ] Expandir para mercados internacionais
- [ ] Implementar internacionalização (i18n)
- [ ] Criar versão em Espanhol
- [ ] Criar versão em Inglês
- [ ] Adicionar 50 receitas adicionais

---

## 🗓️ ROADMAP DETALHADO

### SEMANA 1-2: Comunidade & Ranking (CRÍTICO)

**Objetivo:** Implementar feed de posts e sistema de votação

**Tarefas:**
1. Criar componente de Feed de Posts
2. Implementar upload de imagens/vídeos
3. Criar componente de Modal para novo post
4. Implementar sistema de likes/comentários
5. Criar componente de Leaderboard
6. Implementar ranking por categoria
7. Testar fluxo completo
8. Salvar checkpoint

**Deliverables:**
- Feed funcional com posts de usuários
- Leaderboard com top 3 por categoria
- Botão de compartilhamento para Instagram/TikTok

### SEMANA 3-4: Marketplace (CRÍTICO)

**Objetivo:** Implementar catálogo de produtos e carrinho

**Tarefas:**
1. Criar componente de Catálogo
2. Implementar filtros por categoria
3. Criar componente de Detalhe do Produto
4. Implementar carrinho de compras
5. Criar componente de Checkout
6. Integrar Stripe
7. Testar fluxo completo
8. Salvar checkpoint

**Deliverables:**
- Marketplace funcional com 50+ produtos
- Carrinho e checkout funcionando
- Pagamento via Stripe

### SEMANA 5-6: Monetização (CRÍTICO)

**Objetivo:** Implementar tiers premium e comissão

**Tarefas:**
1. Criar componente de Pricing
2. Implementar upgrade para MESTRE
3. Implementar upgrade para CLUBE_BRO
4. Criar paywall para receitas premium
5. Implementar destaque na comunidade
6. Criar trial de 7 dias
7. Testar fluxo completo
8. Salvar checkpoint

**Deliverables:**
- Tiers premium funcionando
- Paywall para receitas
- Trial de 7 dias

### SEMANA 7-8: SEO & Marketing

**Objetivo:** Otimizar para buscas e criar conteúdo

**Tarefas:**
1. Implementar meta tags dinâmicas
2. Adicionar schema.org markup
3. Criar sitemap.xml
4. Criar 50 artigos sobre fermentação
5. Integrar Google Analytics
6. Implementar Sentry
7. Criar landing page
8. Salvar checkpoint

**Deliverables:**
- Site otimizado para SEO
- 50 artigos publicados
- Landing page conversora

### SEMANA 9-10: Seed de Receitas & Testes

**Objetivo:** Popular banco e testar tudo

**Tarefas:**
1. Criar 50 receitas estruturadas
2. Executar script de seed
3. Testar visualização de receitas
4. Criar testes unitários
5. Criar testes de integração
6. Testar performance
7. Testar segurança
8. Salvar checkpoint

**Deliverables:**
- 50 receitas no banco
- Testes passando 100%
- Performance otimizada

### SEMANA 11-12: Deploy & Beta

**Objetivo:** Deploy em produção e beta testing

**Tarefas:**
1. Configurar CI/CD
2. Deploy em staging
3. Deploy em produção
4. Recrutar 10 beta testers
5. Coletar feedback
6. Corrigir bugs
7. Otimizar UX
8. Salvar checkpoint

**Deliverables:**
- Site em produção
- 10 beta testers
- Feedback coletado

### SEMANA 13-14: Lançamento Público

**Objetivo:** Lançar publicamente e crescer

**Tarefas:**
1. Criar assets de marketing
2. Lançar no Product Hunt
3. Postar no Reddit
4. Postar no Twitter
5. Criar conteúdo no TikTok
6. Fazer outreach com influenciadores
7. Criar press release
8. Salvar checkpoint

**Deliverables:**
- Lançamento público
- 1.000+ usuários
- Cobertura de mídia

---

## 💰 MODELO DE NEGÓCIO

### Receita Streams

| Stream | Modelo | Margem | Ano 1 |
|--------|--------|--------|-------|
| Premium (MESTRE) | R$ 9,90/mês | 90% | R$ 120k |
| Premium (CLUBE_BRO) | R$ 19,90/mês | 90% | R$ 180k |
| Marketplace (Comissão) | 20% de vendas | 80% | R$ 200k |
| Publicidade | CPM/CPC | 70% | R$ 50k |
| **Total** | | **85%** | **R$ 550k** |

### Projeção de Usuários

| Mês | Usuários | MRR | Churn |
|-----|----------|-----|-------|
| 1 | 100 | R$ 1k | 5% |
| 3 | 500 | R$ 5k | 4% |
| 6 | 2k | R$ 20k | 3% |
| 12 | 10k | R$ 100k | 2% |
| 24 | 50k | R$ 500k | 2% |

### CAC & LTV

- **CAC (Customer Acquisition Cost):** R$ 50
- **LTV (Lifetime Value):** R$ 500
- **LTV:CAC Ratio:** 10:1 ✅ (Saudável)

### Burn Rate & Runway

- **Custos Mensais:** R$ 10k (servidor, APIs, pessoal)
- **Break-even:** Mês 6 (com 2k usuários)
- **Runway:** 12 meses (com R$ 120k iniciais)

---

## 🔍 ESTRATÉGIA DE SEO

### Palavras-chave Alvo

**Alto Volume (1k-10k/mês):**
- "como fazer cerveja em casa"
- "receita de kombucha"
- "fermentação caseira"
- "como fazer queijo em casa"
- "receita de iogurte caseiro"

**Cauda Longa (100-1k/mês):**
- "como fazer IPA em casa passo a passo"
- "melhor receita de fermentado para iniciantes"
- "kit para fazer cerveja em casa"
- "como fazer queijo fresco caseiro"
- "fermentação anaeróbica vs aeróbica"

### Estratégia de Conteúdo

1. **Blog Posts (50 artigos)**
   - 10 guias completos (2k+ palavras)
   - 20 receitas detalhadas (1.5k palavras)
   - 20 dicas e macetes (500-800 palavras)

2. **FAQ Section**
   - 30 perguntas frequentes
   - Otimizadas para featured snippets

3. **Video Content**
   - 20 vídeos de receitas
   - 10 vídeos educacionais
   - 5 vídeos de testimoniais

4. **Backlinks**
   - Parcerias com blogs de culinária
   - Guest posts em sites de fermentação
   - Menção em comunidades Reddit

### Métricas de Sucesso

- **Organic Traffic:** 10k visitantes/mês (Mês 12)
- **Rankings:** Top 3 para 20+ palavras-chave
- **Conversão:** 5% de visitantes → usuários
- **Domain Authority:** 30+ (Mês 12)

---

## 🚀 PLANO DE LANÇAMENTO

### Pré-Lançamento (Semana -2)

- [ ] Criar landing page
- [ ] Preparar vídeo de apresentação
- [ ] Criar assets de marketing (imagens, GIFs)
- [ ] Escrever press release
- [ ] Recrutar beta testers

### Lançamento (Semana 0)

- [ ] Lançar no Product Hunt
- [ ] Postar no Reddit (/r/fermentation, /r/homebrewing, /r/brasil)
- [ ] Postar no Twitter/X
- [ ] Enviar para newsletters de tech
- [ ] Fazer outreach com influenciadores

### Pós-Lançamento (Semana 1-4)

- [ ] Coletar feedback de usuários
- [ ] Corrigir bugs críticos
- [ ] Otimizar onboarding
- [ ] Criar conteúdo no TikTok/Instagram
- [ ] Implementar referral program
- [ ] Expandir para comunidades internacionais

### Crescimento (Mês 2-3)

- [ ] Atingir 1.000 usuários
- [ ] Implementar programa de afiliados
- [ ] Expandir marketplace
- [ ] Adicionar 50 receitas adicionais
- [ ] Criar versão em Espanhol/Inglês

---

## 📊 MÉTRICAS DE SUCESSO

### Métricas de Produto

| Métrica | Mês 1 | Mês 3 | Mês 6 | Mês 12 |
|---------|-------|-------|-------|--------|
| DAU | 50 | 200 | 500 | 2k |
| MAU | 100 | 500 | 2k | 10k |
| Retenção (D30) | 30% | 40% | 50% | 60% |
| Engagement | 2 msgs/dia | 3 msgs/dia | 4 msgs/dia | 5 msgs/dia |
| ARPU | R$ 5 | R$ 8 | R$ 10 | R$ 15 |

### Métricas de Negócio

| Métrica | Mês 1 | Mês 3 | Mês 6 | Mês 12 |
|---------|-------|-------|-------|--------|
| MRR | R$ 1k | R$ 5k | R$ 20k | R$ 100k |
| CAC | R$ 50 | R$ 40 | R$ 30 | R$ 25 |
| LTV | R$ 100 | R$ 150 | R$ 200 | R$ 300 |
| Churn | 5% | 4% | 3% | 2% |

---

## 🎯 CONCLUSÃO

O BROCRAFT tem potencial para ser a **#1 plataforma de fermentação do Brasil** se executarmos este plano com disciplina.

**Próximos 90 dias são críticos:**
1. Semana 1-2: Comunidade & Ranking
2. Semana 3-4: Marketplace
3. Semana 5-6: Monetização
4. Semana 7-8: SEO & Marketing
5. Semana 9-10: Seed & Testes
6. Semana 11-12: Deploy & Beta
7. Semana 13-14: Lançamento

**Investimento Necessário:**
- Desenvolvimento: R$ 30k (já investido)
- Marketing: R$ 20k
- Infraestrutura: R$ 5k
- **Total: R$ 55k**

**Retorno Esperado (Ano 1):**
- Receita: R$ 550k
- Lucro: R$ 400k
- **ROI: 727%**

---

**Criado em:** Dezembro 2025  
**Versão:** 1.0  
**Status:** Pronto para Execução ✅
