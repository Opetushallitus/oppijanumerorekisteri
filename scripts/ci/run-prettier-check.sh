#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
source "${repo}/scripts/lib/common-functions.sh"

function main {
  cd "$repo/infra"
  init_nodejs
  npm_ci_if_needed
  npx prettier . --check

  cd "$repo/henkilo-ui/src/main/static"
  npm_ci_if_needed
  npx prettier 'src/**/*{ts,tsx}' --check
}

main "$@"
