https://brocraft-ai-pa3tuvfp.manus.space

# BROCRAFT v∞ - Project TODO

## Fase 1: Arquitetura e Setup (MVP Core)

- [x] Inicializar projeto Next.js com T3 Stack (tRPC + Drizzle + Auth)
- [x] Configurar schema Drizzle com tabelas: User, Message, Recipe, UserRecipe, Badge
- [x] Implementar sistema de autenticação (Manus OAuth)
- [x] Configurar variáveis de ambiente (API keys: Anthropic, OpenAI, Redis)
- [x] Integrar Redis (Upstash) para cache de respostas IA
- [x] Criar tRPC routers para chat, XP, receitas

## Fase 2: Backend - APIs e Lógica de Negócio

- [x] Implementar API de Chat com roteamento inteligente de LLM (Claude/OpenAI)
- [x] Implementar sistema de XP e Ranks (NOVATO → LEGEND)
- [x] Implementar sistema de Badges e Gamificação
- [ ] Criar seed de 50 receitas iniciais (Cerveja, Fermentados, Queijos, Charcutaria)
- [ ] Implementar avisos de segurança (Botulismo, Destilação Ilegal)
- [ ] Implementar cache Redis com estratégia de hit/miss
- [ ] Criar testes unitários para APIs críticas

## Fase 3: Frontend - UI/UX

- [x] Criar layout principal com navegação
- [x] Implementar interface de chat com streaming de respostas
- [x] Criar componentes de Rank e XP Bar
- [x] Implementar sistema de receitas (visualização, filtros, favoritos)
- [x] Criar dashboard de perfil do usuário
- [x] Implementar responsividade mobile
- [ ] Adicionar animações e micro-interações (Framer Motion)

## Fase 4: Gamificação Avançada

- [ ] Implementar sistema de Badges com SVG dinâmicos
- [ ] Criar animações de rank-up
- [ ] Implementar notificações de XP e conquistas
- [ ] Criar leaderboard (opcional para MVP)
- [ ] Implementar streak system (login diário)

## Fase 5: Monetização

- [ ] Integrar Stripe para pagamentos
- [ ] Implementar paywall para tier MESTRE (R$ 9,90/mês)
- [ ] Implementar paywall para tier CLUBE_BRO (R$ 19,90/mês)
- [ ] Criar página de upgrade
- [ ] Implementar trial de 7 dias para MESTRE
- [ ] Adicionar limites por tier (FREE: 50 receitas, MESTRE: ilimitado)

## Fase 6: Segurança e Compliance

- [ ] Adicionar pop-up obrigatório para destilados (educacional)
- [ ] Implementar avisos de botulismo para charcutaria
- [ ] Criar Termos de Uso
- [ ] Implementar LGPD compliance básico
- [ ] Adicionar rate limiting nas APIs
- [ ] Implementar sanitização de inputs

## Fase 7: SEO e Marketing

- [ ] Criar landing page otimizada para SEO
- [ ] Implementar meta tags e schema.org
- [ ] Criar blog/FAQ com conteúdo gerado pela IA
- [ ] Implementar sitemap.xml e robots.txt
- [ ] Configurar Google Analytics
- [ ] Preparar social media assets

## Fase 8: Deploy e Testes

- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Fazer testes de carga (k6 ou Artillery)
- [ ] Configurar monitoramento (Sentry ou LogRocket)
- [ ] Fazer backup do banco de dados
- [ ] Deploy em produção (Vercel)
- [ ] Testes manuais extensivos

## Fase 9: Beta e Feedback

- [ ] Convidar 10 beta users
- [ ] Coletar feedback
- [ ] Ajustar prompts da IA baseado em feedback
- [ ] Corrigir bugs críticos
- [ ] Otimizar performance

## Fase 10: Lançamento Público

- [ ] Anunciar publicamente
- [ ] Postar em Reddit (r/Homebrewing)
- [ ] Postar no Twitter (#homebrewing)
- [ ] Criar #BROCRAFTCHALLENGE
- [ ] Monitorar métricas (DAU, conversão, NPS)

## Bugs e Issues

- [ ] Nenhum identificado ainda

## Melhorias Futuras (Pós-MVP)

- [ ] App mobile (PWA)
- [ ] Fórum de comunidade
- [ ] Integração com sensores IoT
- [ ] Modo offline com sincronização
- [ ] Suporte a múltiplos idiomas
- [ ] API pública para integradores


## Fase 11: Seed de Receitas (50 Receitas Base)

- [ ] Criar 15 receitas de cerveja (Pilsen, IPA, Stout, Hazy IPA, etc)
- [ ] Criar 15 receitas de fermentados (Kimchi, Kombucha, Levain, Miso, etc)
- [ ] Criar 10 receitas de queijos (Ricota, Minas, Mozzarella, etc)
- [ ] Criar 10 receitas de charcutaria (Salame, Guanciale, Pastrami, etc)
- [ ] Validar estrutura JSON (rajado, classico, mestre, macete, warnings)
- [ ] Implementar script de seed no banco de dados
- [ ] Testar visualização de receitas na UI

## Fase 12: Integração Stripe (Monetização)

- [ ] Criar conta Stripe Brasil
- [ ] Configurar produtos (MESTRE, CLUBE_BRO)
- [ ] Integrar Stripe SDK no backend
- [ ] Implementar checkout flow
- [ ] Configurar webhooks para pagamentos
- [ ] Implementar paywall para MESTRE
- [ ] Implementar paywall para CLUBE_BRO
- [ ] Testar fluxo de compra (modo teste)
- [ ] Criar página de upgrade
- [ ] Implementar trial de 7 dias (opcional)

## Fase 13: SEO e Landing Page

- [ ] Criar landing page otimizada
- [ ] Implementar meta tags (title, description, og:image)
- [ ] Adicionar schema.org markup (Article, FAQPage, Tool, Organization)
- [ ] Criar seção de blog/FAQ
- [ ] Implementar sitemap.xml
- [ ] Configurar robots.txt
- [ ] Criar 10 artigos de blog (SEO-otimizados)
- [ ] Implementar ferramentas utilitárias (calculadora IBU, ABV)
- [ ] Configurar Google Analytics
- [ ] Submeter ao Google Search Console

## Fase 14: Beta Fechado (10 Usuários)

- [ ] Convidar 10 beta users
- [ ] Monitorar uso e coletar feedback
- [ ] Ajustar prompts da IA baseado em feedback
- [ ] Corrigir bugs críticos
- [ ] Otimizar performance
- [ ] Preparar relatório de feedback

## Fase 15: Lançamento Público (MVP 2.0)

- [ ] Deploy em produção (Vercel)
- [ ] Criar assets de marketing (screenshots, vídeo demo)
- [ ] Postar no Reddit (r/Homebrewing, r/Fermentation)
- [ ] Postar no Twitter (#homebrewing, #craftbeer)
- [ ] Submeter ao Product Hunt
- [ ] Criar #BROCRAFTCHALLENGE
- [ ] Monitorar métricas (DAU, conversão, NPS)
- [ ] Configurar monitoramento (Sentry, LogRocket)

## Fase 16: Crescimento e Otimização (Mês 2-3)

- [ ] Criar 50 receitas adicionais (total 100)
- [ ] Implementar badges com SVG dinâmicos
- [ ] Otimizar SEO (mais artigos, backlinks)
- [ ] Implementar email marketing
- [ ] Criar fórum/comunidade (Discord/Slack)
- [ ] Análise de retenção e ajustes
- [ ] Implementar A/B testing de preços
- [ ] Expandir para novos idiomas (espanhol, inglês)
