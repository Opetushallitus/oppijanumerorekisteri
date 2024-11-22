#!/usr/bin/env bash
set -o nounset -o pipefail -o errexit

env="$1"
time ./pg_dump.sh "${env}" --verbose --format custom --file "${env}-$( date +%Y-%m-%d ).dump" --exclude-schema=export --exclude-schema=pseudonymized
