#!/usr/bin/env bash
set -o nounset -o pipefail -o errexit

env="$1"
dump="$2"
time ./pg_restore.sh "${env}" --verbose --clean --no-owner --no-privileges "${dump}"
