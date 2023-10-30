#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail -o xtrace
readonly repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly session="henkilo-ui"

cd "$repo"
tmux kill-session -t "$session" || true
tmux start-server
tmux new-session -d -s "$session" -c "$repo"

tmux select-pane -t 0
tmux send-keys "docker-compose -f $repo/nginx/docker-compose.yml down; docker-compose -f $repo/nginx/docker-compose.yml up" C-m

tmux splitw -v
tmux select-pane -t 1
tmux send-keys "cd $repo/src/main/static; npm start" C-m

open "http://localhost:8080"

tmux attach-session -t "$session"
