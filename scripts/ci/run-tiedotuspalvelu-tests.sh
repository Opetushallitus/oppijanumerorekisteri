#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( dirname "${BASH_SOURCE[0]}" )/../lib/common-functions.sh"

trap cleanup EXIT INT QUIT TERM

function main {
  select_java_version "21"

  cd "${repo}/tiedotuspalvelu"

  if is_running_on_ci; then
    docker compose up -d
  fi

  wait_for_container_to_be_healthy oph-tiedotuspalvelu-test-db
  wait_for_container_to_be_healthy oph-tiedotuspalvelu-keycloak

  mvn --batch-mode clean install
}

function cleanup {
  if is_running_on_ci; then
    docker compose down
  fi
}

main "$@"
