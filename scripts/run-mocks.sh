#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/lib/common-functions.sh"

function main {
  cd "$repo"
  select_java_version "21"

  cd "$repo/henkilo-ui/src/main/static/mock-api"
  init_nodejs
  pnpm_ci

  export PORT=8484
  node ./src/app.js
}

main "$@"
