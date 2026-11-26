#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
source "${repo}/scripts/lib/common-functions.sh"

function main {
  cd "${repo}/henkilo-ui/src/main/static"
  init_nodejs
  pnpm_ci

  pnpm run lint
  pnpm run ci:install-deps
  pnpm run ci:chromium
  pnpm run test
}

main "$@"
