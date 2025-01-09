#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
readonly repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"

trap "docker compose down" EXIT

function main {
  cd "$repo"
  docker compose up -d
  mvn clean install -s ./settings.xml
}

main "$@"