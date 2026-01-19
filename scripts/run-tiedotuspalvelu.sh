#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/lib/common-functions.sh"

function main {
  select_java_version "21"
  cd "${repo}/tiedotuspalvelu"
  wait_for_container_to_be_healthy oph-tiedotuspalvelu-db

  local -r jvm_args=(
    "--add-opens=java.base/java.lang=ALL-UNNAMED"
    "-Dnet.bytebuddy.experimental=true"
    "-Dspring.profiles.active=local"
  )

  ../mvnw clean install -DskipTests
  ../mvnw -Dspring-boot.run.jvmArguments="${jvm_args[*]}" spring-boot:run
}

main "$@"
