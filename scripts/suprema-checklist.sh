#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

BLUE="\033[34m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; RESET="\033[0m"
STRICT=${SUPREMA_STRICT:-0}
FAILURES=0

log() { printf "%b\n" "$1"; }
section() { log "${BLUE}▸ $1${RESET}"; }
ok() { log "${GREEN}✔ $1${RESET}"; }
warn() { log "${YELLOW}⚠ $1${RESET}"; }
fail() { log "${RED}✘ $1${RESET}"; FAILURES=$((FAILURES+1)); }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing dependency: $1"
    exit 1
  fi
}

require pnpm
require rg

section "Lint + types + tests"
if pnpm lint; then ok "lint"; else fail "lint"; fi
if pnpm check; then ok "tsc --noEmit"; else fail "tsc --noEmit"; fi
if pnpm test; then ok "vitest run"; else fail "vitest run"; fi

section "Cores hardcoded (hex)"
COLOR_RESULTS="$(rg --color=never --line-number --no-heading --iglob "*.{ts,tsx,css,scss,js,jsx}" "#[0-9a-fA-F]{3,8}" client server shared api || true)"
if [[ -n "$COLOR_RESULTS" ]]; then
  warn "Cores hex encontradas; use tokens semânticos/tailwind vars"
  printf "%s\n" "$COLOR_RESULTS"
  [[ "$STRICT" -eq 1 ]] && fail "Bloqueado por cores hardcoded"
else
  ok "Nenhuma cor hex encontrada"
fi

section "Queries sem org_id"
ORG_MATCH_COUNT=$(rg --color=never --count "org_id|orgId" server api || true)
if [[ -z "$ORG_MATCH_COUNT" || "$ORG_MATCH_COUNT" =~ ^0$ ]]; then
  warn "Nenhuma referência a org_id/orgId encontrada em server/api. Certifique-se de modelar multi-tenant."
  [[ "$STRICT" -eq 1 ]] && fail "Bloqueado por ausência de org_id"
else
  ok "Referências a org_id/orgId identificadas"
fi

if [[ "$FAILURES" -gt 0 ]]; then
  log "${RED}Checklist falhou (${FAILURES} itens).${RESET}"
  exit 1
else
  log "${GREEN}Checklist concluído sem falhas bloqueantes.${RESET}"
fi
