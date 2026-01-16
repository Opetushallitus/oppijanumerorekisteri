#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd ../.. && pwd)"
source "${repo}/scripts/lib/common-functions.sh"

function main {
  run_prettier_check
  run_java_check
}

function run_prettier_check {
  cd "$repo/infra"
  init_nodejs
  npm_ci_if_needed
  npx prettier . --check

  cd "$repo/henkilo-ui/src/main/static"
  npm_ci_if_needed
  npx prettier 'src/**/*{ts,tsx}' --check
}

function run_java_check {
  cd "$repo/tiedotuspalvelu"
  select_java_version 21
  ../mvnw fmt:check
}

main "$@"
