# MATRIZ GÊNESIS — Domínio Absoluto

## Leis Sagradas (imutáveis)
1. Multi-tenant preservado, dados reais e estado de UI consistente em cada rota crítica.
2. Tema luxury (paleta dourada + tipografia refinada) guiado por tokens centralizados; zero cores hardcoded novas.
3. Segurança e governança: lint + type-check + build obrigatórios no pre-commit, bloqueio de hardcodes/mocks em linhas novas e logs limpos.
4. Performance primeiro: lazy loading em rotas pesadas, memo em componentes caros e limites de bundle controlados.
5. Documentação como SSOT: README, ARCHITECTURE e este documento permanecem alinhados ao código.

## Progresso 100% — BLOCO 5
- ✅ Guard rails: Husky + lint-staged + `scripts/check-hardcoded.sh` verificando cores/mocks em linhas adicionadas; pre-commit roda lint, check e build.
- ✅ Performance: `chunkSizeWarningLimit` elevado (1000 KB), rotas React em lazy loading, `MapView` memorizado.
- ✅ Documentação eterna: README atualizado com badge, deploy e uso; `docs/ARCHITECTURE.md` e esta MATRIZ registram SSOT e rituais.
- ✅ Validação final esperada: `pnpm lint` e `pnpm build` limpos antes de merge/deploy.

## Rituais de verificação rápida
- `pnpm lint` — qualidade de código front/back.
- `pnpm check` — TypeScript strict sem emissões.
- `pnpm build` — bundle pronto para produção.
- `pnpm run check:hardcoded` — garante ausência de cores hex, tons de cinza ou mocks nas linhas novas.

## Manutenção contínua
- Atualize README e ARCHITECTURE a cada evolução arquitetural ou novo fluxo crítico.
- Evite regressões de performance monitorando bundles (vite) e páginas que precisam de lazy load.
- Para novos domínios/SSOTs, registre-os aqui e em ARCHITECTURE antes de codar.
