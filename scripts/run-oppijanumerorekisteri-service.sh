#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/lib/common-functions.sh"

function main {
  select_java_version "21"
  require_command mvn
  cd "$repo"
  mvn install -DskipTests
  cd "$repo/oppijanumerorekisteri-service"
  mvn install -DskipTests
  wait_for_local_db_to_be_healthy

  java \
    --add-opens java.base/java.lang=ALL-UNNAMED \
    -Dnet.bytebuddy.experimental=true \
    -Dspring.config.additional-location=classpath:/config/local.yml \
    -jar "$repo"/oppijanumerorekisteri-service/target/oppijanumerorekisteri-service-2021.01-SNAPSHOT.jar
}

main "$@"
