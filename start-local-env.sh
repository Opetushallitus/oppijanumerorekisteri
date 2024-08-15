#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail -o xtrace
readonly repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

function stop() {
  cd "$repo"
  docker-compose down
}
trap stop EXIT

function main {
  cd "$repo"
  local -r session="oppijanumerorekisteri"
  tmux kill-session -t "$session" || true
  tmux start-server
  tmux new-session -d -s "$session"

  tmux select-pane -t 0
  tmux send-keys "docker-compose down --volumes; docker-compose up --force-recreate --renew-anon-volumes" C-m

  tmux select-pane -t 0
  tmux splitw -h
  tmux send-keys "$repo/scripts/run-oppijanumerorekisteri-service.sh" C-m

  tmux attach-session -t "$session"
}

main "$@"
