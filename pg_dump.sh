#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( dirname "${BASH_SOURCE[0]}" )/scripts/lib/common-functions.sh"

function main {
  export ENV="$1"; shift
  local -r SERVICE="oppijanumerorekisteri"

  init_cloud_base_virtualenv

  if [ "${ENV}" = "hahtuva" ]; then
    export PROFILE="oph-dev"
    TUNNEL_PORT="6671"
    db_hostname="${SERVICE}.db.hahtuvaopintopolku.fi"
  elif [ "${ENV}" = "untuva" ]; then
    export PROFILE="oph-dev"
    TUNNEL_PORT="6672"
    db_hostname="${SERVICE}.db.untuvaopintopolku.fi"
  elif [ "${ENV}" = "pallero" ]; then
    export PROFILE="oph-dev"
    TUNNEL_PORT="6673"
    db_hostname="${SERVICE}.db.testiopintopolku.fi"
  elif [ "${ENV}" = "sade" ]; then
    export PROFILE="oph-prod"
    TUNNEL_PORT="6674"
    db_hostname="${SERVICE}.db.opintopolku.fi"
  fi

  db_username="app"
  db_password="$( get_parameter "/${ENV}/postgresqls/${SERVICE}/app-user-password" )"

  start_tunnel "${TUNNEL_PORT}:${db_hostname}:5432"
  PGPASSWORD=$db_password pg_dump --user "$db_username" --host localhost --port $TUNNEL_PORT --dbname oppijanumerorekisteri "$@"
}

function start_tunnel {
  local -r tunnel="$1"
  info "Starting SSH tunnel"
  # SSH keeps the connection and tunnel open until both the command executed is finished and all connections through
  # the tunnel are closed. Therefore as long as we have the psql connection open, the tunnel will stay open and close
  # automatically when all connections are closed.
  ssh -f -L "${tunnel}" "${ENV}-bastion" sleep 10
}

function get_parameter {
  local -r parameter_name="$1"
  aws ssm get-parameter \
    --name "${parameter_name}" \
    --with-decryption \
    --region eu-west-1 \
    --profile "${PROFILE}" \
    --query "Parameter.Value" \
    --output text
}

function init_cloud_base_virtualenv {
  pushd "$repo/../cloud-base"
  info "Pulling latest cloud-base"
  git pull --rebase
  . oph-venv/bin/activate
  pip install --requirement requirements.txt > /dev/null
  popd
}

time main "$@"
