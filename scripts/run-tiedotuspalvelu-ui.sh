#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/lib/common-functions.sh"

function main {
  cd "${repo}/tiedotuspalvelu/web"
  init_nodejs
  npm_ci_if_needed
  npx webpack serve
}

main "$@"
