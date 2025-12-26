#!/usr/bin/env bash
set -euo pipefail

TARGET_ROOTS=("client/src" "server" "shared" "api")

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "⚠️  check-hardcoded: repositório git não detectado, verificação ignorada."
  exit 0
fi

STAGED_DIFF=$(git diff --cached -U0 -- "${TARGET_ROOTS[@]}" || true)

if [[ -z "$STAGED_DIFF" ]]; then
  echo "✅ check-hardcoded: sem alterações staged nos alvos (${TARGET_ROOTS[*]})."
  exit 0
fi

violations=0

check_pattern() {
  local pattern="$1"
  local description="$2"

  if echo "$STAGED_DIFF" | grep -E "^\+[^+].*${pattern}" >/dev/null; then
    echo "❌ Bloqueado: ${description}" >&2
    echo "$STAGED_DIFF" | grep -nE "^\+[^+].*${pattern}" >&2
    violations=1
  fi
}

check_pattern "#[0-9a-fA-F]{6}" "hex code hardcoded em linhas adicionadas"
check_pattern "gray-" "tons de cinza não padronizados em linhas adicionadas"
check_pattern "mock|fake|placeholder" "referências de mock/fake/placeholder em linhas adicionadas"

if [[ "$violations" -eq 1 ]]; then
  echo "⚠️  Remova hardcodes ou mocks antes de commitar."
  exit 1
fi

echo "✅ check-hardcoded: nenhum hardcode/mocks encontrado nas linhas adicionadas."
