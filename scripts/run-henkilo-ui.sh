#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/lib/common-functions.sh"

function main {
  cd "$repo"
  select_java_version "21"

  cd "$repo/henkilo-ui/src/main/static"
  init_nodejs
  npm_ci_if_needed

  npm start
}

main "$@"
