#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$(dirname "$0")" && pwd )/lib/common-functions.sh"

function main {
  local -r env=$(parse_env_from_script_name)
  local param_type="SecureString"
  local param_name=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --string)
        param_type="String"
        shift
        ;;
      *)
        if [ -n "${param_name}" ]; then
          fatal "Usage: $0 [--string] <ssm-parameter-name> nyaa~"
        fi
        param_name="$1"
        shift
        ;;
    esac
  done

  if [ -z "${param_name}" ]; then
    fatal "Usage: $0 [--string] <ssm-parameter-name>"
  fi

  case "${env}" in
    "hahtuva" | "dev" | "qa" | "prod")
      upsert_parameter "${env}" "${param_name}" "${param_type}"
      ;;
    *)
      fatal "Unknown env ${env}"
      ;;
  esac
}

function upsert_parameter {
  local -r env="$1"
  local -r param_name="$2"
  local -r param_type="$3"
  export_aws_credentials "${env}"

  info "Upserting SSM parameter ${param_name} (${param_type}) in ${env}"

  if [ "${param_type}" = "String" ]; then
    read -rp "Enter value for ${param_name}: " param_value
  else
    read -rsp "Enter value for ${param_name}: " param_value
    echo
  fi

  if [ -z "${param_value}" ]; then
    fatal "Value must not be empty"
  fi

  aws ssm put-parameter \
    --name "${param_name}" \
    --type "${param_type}" \
    --value "${param_value}" \
    --overwrite

  info "Parameter ${param_name} updated in ${env}"
}

main "$@"
