#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd ../.. && pwd)"
source "${repo}/scripts/lib/common-functions.sh"

function main {
  run_prettier_check
}

function run_prettier_check {
  cd "$repo/infra"
  init_nodejs
  pnpm_ci
  pnpm exec prettier . --check --ignore-path="$repo/.gitignore" --ignore-path="$repo/.prettierignore"

  cd "$repo/henkilo-ui/src/main/static"
  pnpm_ci
  pnpm exec prettier 'src/**/*{ts,tsx}' --check
}

main "$@"
