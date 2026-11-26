#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
source "${repo}/scripts/lib/common-functions.sh"

function main {
  run_prettier_write
}

function run_prettier_write {
  for dir in "$repo/infra" "$repo/henkilo-ui/src/main/static"; do
    cd "$dir"
    init_nodejs
    pnpm_ci
    local -a ignore_args=("--ignore-path=$repo/.gitignore")
    ignore_args+=("--ignore-path=$repo/.prettierignore")
    if [ -f ".gitignore" ]; then
      ignore_args+=("--ignore-path=.gitignore")
    fi
    pnpm exec prettier . --write "${ignore_args[@]}"
  done
}

main "$@"
