#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( dirname "${BASH_SOURCE[0]}" )/../lib/common-functions.sh"

trap cleanup EXIT INT QUIT TERM

backend_pid=""

function main {
  select_java_version "21"

  cd "$repo"

  if is_running_on_codebuild || is_running_on_github_actions; then
    docker compose up -d
  fi

  cd "${repo}/tiedotuspalvelu/web"
  init_nodejs
  npm_ci_if_needed
  npx webpack build

  wait_for_container_to_be_healthy oph-tiedotuspalvelu-test-db
  wait_for_container_to_be_healthy oph-tiedotuspalvelu-keycloak

  start_backend

  cd "${repo}/tiedotuspalvelu/web"
  npx playwright install-deps
  npx playwright install chromium
  npx playwright test "$@"
}

function start_backend {
  info "Building tiedotuspalvelu backend"
  cd "${repo}/tiedotuspalvelu"
  "${repo}"/mvnw --batch-mode package -DskipTests

  info "Starting tiedotuspalvelu backend"
  local -r port=8088
  export SERVER_PORT="${port}"
  export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5437/tiedotuspalvelu"
  export TIEDOTUSPALVELU_OPPIJA_ORIGIN="http://localhost:${port}"
  export TIEDOTUSPALVELU_VIRKAILIJA_ORIGIN="http://localhost:${port}"
  export TIEDOTUSPALVELU_API_BASE_URL="http://localhost:${port}"
  export TIEDOTUSPALVELU_TESTAPI_ENABLED="true"
  java --add-opens=java.base/java.lang=ALL-UNNAMED -Dspring.profiles.active=local -jar target/tiedotuspalvelu-*.jar &
  backend_pid=$!

  info "Waiting for backend to start on port ${port}"
  local -r max_wait=120
  local waited=0
  until curl -sf "http://localhost:${port}/omat-viestit/actuator/health" >/dev/null 2>&1; do
    if [ $waited -ge $max_wait ]; then
      fatal "Backend did not start within ${max_wait}s"
    fi
    sleep 2
    waited=$((waited + 2))
  done
  info "Backend is ready"
}

function cleanup {
  if [ -n "$backend_pid" ]; then
    info "Stopping backend (pid $backend_pid)"
    kill "$backend_pid" 2>/dev/null || true
    wait "$backend_pid" 2>/dev/null || true
  fi

  if is_running_on_codebuild || is_running_on_github_actions; then
    docker compose down
  fi
}

main "$@"
