#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( dirname "${BASH_SOURCE[0]}" )/../lib/common-functions.sh"

trap cleanup EXIT INT QUIT TERM

function main {
  select_java_version "21"

  cd "$repo"

  if is_running_on_codebuild || is_running_on_github_actions; then
    docker compose up -d
  fi

  if is_running_on_codebuild; then
    ./mvnw --batch-mode clean install -s ./settings.xml
  else
    ./mvnw --batch-mode clean install
  fi
}

function cleanup {
  if is_running_on_codebuild || is_running_on_github_actions; then
    docker compose down
  fi
}

main "$@"
