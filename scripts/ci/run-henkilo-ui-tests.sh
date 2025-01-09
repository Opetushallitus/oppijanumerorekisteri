#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
source "${repo}/scripts/lib/common-functions.sh"

trap cleanup EXIT

function main {
  init_nodejs

  cd "${repo}/henkilo-ui/src/main/static"

  npm_ci_if_needed

  npm run lint
  npm run prettier
  npx playwright install-deps
  npm run e2e:install-deps
  CI=true npm run e2e:ci
}

main "$@"
