#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/lib/common-functions.sh"

function main {
  cd "$repo"
  select_java_version "21"

  cd "$repo/henkilo-ui/src/main/static/mock-api"
  init_nodejs
  npm_ci_if_needed

  node ./src/app.js
}

main "$@"
