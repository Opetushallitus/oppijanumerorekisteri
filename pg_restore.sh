#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( dirname "${BASH_SOURCE[0]}" )/scripts/lib/common-functions.sh"

IMAGE_TAG="kayttooikeus-psql-tunnel"

function main {
  export ENV="$1"; shift
  export_aws_credentials "$ENV"
  if [ "${ENV}" = "hahtuva" ]; then
    export TUNNEL_PORT="6871"
  elif [ "${ENV}" = "dev" ]; then
    export TUNNEL_PORT="6872"
  elif [ "${ENV}" = "qa" ]; then
    export TUNNEL_PORT="6873"
  elif [ "${ENV}" = "prod" ]; then
    export TUNNEL_PORT="6874"
  fi

  export ECS_CLUSTER_NAME="oppijanumerorekisteri"
  export SERVICE_NAME="OppijanumerorekisteriBastion"
  export DB_SECRET="OppijanumerorekisteriDatabaseSecret"

  start_tunnel
  sleep 3
  start_pg_restore "$@"
}

function start_pg_restore {
  info "Fetching password from AWS Secrets manager"
  username="$(aws secretsmanager get-secret-value --secret-id "${DB_SECRET}" --query 'SecretString' --output text | jq -r '.username')"
  password="$(aws secretsmanager get-secret-value --secret-id "${DB_SECRET}" --query 'SecretString' --output text | jq -r '.password')"

  info "Connecting to localhost:$TUNNEL_PORT"
  cd "$repo"
  PGPASSWORD=$password pg_restore --user "$username" --host localhost --port $TUNNEL_PORT --dbname oppijanumerorekisteri "$@"
}

function start_tunnel {
  cd "$repo/scripts/tunnel"
  docker build --tag "${IMAGE_TAG}" .
  info "Starting tunnel from port $TUNNEL_PORT to RDS"
  container_id=$( docker run \
    --env ECS_CLUSTER_NAME --env SERVICE_NAME --env DB_SECRET \
    --env AWS_PROFILE --env AWS_REGION --env AWS_DEFAULT_REGION \
    --env AWS_CONTAINER_CREDENTIALS_RELATIVE_URI \
    --env AWS_ACCESS_KEY_ID --env AWS_SECRET_ACCESS_KEY --env AWS_SESSION_TOKEN \
    --volume "${HOME}/.aws:/root/.aws" \
    --detach \
    --publish "$TUNNEL_PORT:1111" \
    --name "${IMAGE_TAG}-${ENV}" \
    --rm "${IMAGE_TAG}" )
  trap "docker kill \"${IMAGE_TAG}-${ENV}\"" EXIT

  docker container logs --follow "${IMAGE_TAG}-${ENV}" &
  pid_logs=$!
  info "Waiting until $container_id is healthy"
  while ! is_container_healthy $container_id; do sleep 1; done
  kill ${pid_logs}

}

function is_container_healthy {
  local container_id="$1"
  local status="$(docker inspect --format='{{.State.Health.Status}}' $container_id)"
  if [[ "$status" == "healthy" ]]; then
    return 0
  else
    return 1
  fi
}


time main "$@"
