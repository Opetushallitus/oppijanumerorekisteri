#!/usr/bin/env bash
set -o errexit -o nounset -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  create_csr_from_aws_secret.sh \
    --environment <hahtuva|dev|qa|prod>

What it does:
1) Fetches current vtjkysely keystore from ENVIRONMENT.
2) Extracts certificate subject from keystore with keytool
3) Creates a 4096-bit RSA private key in PEM format with a passphrase
4) Creates a CSR using the generated key and extracted subject

Notes:
- The keystore password is fetched from SSM Parameter Store using
  `aws ssm get-parameter --with-decryption`.
- The keystore alias is selected automatically from environment.

Outputs (in `certs` under the script directory):
- vtjkysely_<ENVIRONMENT>_current_keystore.jks
- vtjkysely_<ENVIRONMENT>_private_key_<CURRENT_YEAR>.pem
- vtjkysely_<ENVIRONMENT>_private_key_passphrase_<CURRENT_YEAR>.txt
- vtjkysely_<ENVIRONMENT>_csr_<CURRENT_YEAR>.csr
USAGE
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

trim() {
  local s="$1"
  s="${s#${s%%[![:space:]]*}}"
  s="${s%${s##*[![:space:]]}}"
  printf '%s' "$s"
}

subject_to_openssl_subj() {
  local owner="$1"
  local subj=""
  local pair key value

  while IFS= read -r pair; do
    pair="$(trim "$pair")"
    [[ -z "$pair" ]] && continue
    key="$(trim "${pair%%=*}")"
    value="$(trim "${pair#*=}")"

    # Escape characters that break OpenSSL -subj parsing
    value="${value//\//\\/}"

    subj+="/${key}=${value}"
  done < <(echo "$owner" | sed 's/,/\n/g')

  printf '%s' "$subj"
}

main() {
  local ENVIRONMENT=""
  local STOREPASS=""
  local ALIAS=""
  local OUT_DIR=""
  local SCRIPT_DIR=""
  local CURRENT_YEAR=""
  local KEYSTORE_PATH
  local KEY_PATH
  local KEY_PASSPHRASE_PATH
  local CSR_PATH
  local BASE64_JKS=""
  local OWNER_LINE
  local SUBJ
  local KEY_PASSPHRASE=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --environment)
        ENVIRONMENT="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown argument: $1" >&2
        usage
        exit 1
        ;;
    esac
  done

  if [[ -z "$ENVIRONMENT" ]]; then
    echo "Error: --environment is required." >&2
    usage
    exit 1
  fi

  case "$ENVIRONMENT" in
    hahtuva)
      ALIAS="hahtuvaopintopolku.fi"
      ;;
    dev)
      ALIAS="untuvaopintopolku.fi"
      ;;
    qa)
      ALIAS="testiopintopolku.fi"
      ;;
    prod)
      ALIAS="opintopolku.fi"
      ;;
    *)
      echo "Error: invalid --environment '$ENVIRONMENT'. Allowed values: hahtuva, dev, qa, prod." >&2
      exit 1
      ;;
  esac

  require_cmd aws
  require_cmd keytool
  require_cmd openssl
  require_cmd base64

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  OUT_DIR="$SCRIPT_DIR/certs"
  CURRENT_YEAR="$(date +%Y)"

  mkdir -p "$OUT_DIR"
  KEYSTORE_PATH="$OUT_DIR/vtjkysely_${ENVIRONMENT}_current_keystore.jks"
  KEY_PATH="$OUT_DIR/vtjkysely_${ENVIRONMENT}_private_key_${CURRENT_YEAR}.pem"
  KEY_PASSPHRASE_PATH="$OUT_DIR/vtjkysely_${ENVIRONMENT}_private_key_passphrase_${CURRENT_YEAR}.txt"
  CSR_PATH="$OUT_DIR/vtjkysely_${ENVIRONMENT}_csr_${CURRENT_YEAR}.csr"

  echo "Fetching keystore password from SSM Parameter Store..."
  STOREPASS="$(aws ssm get-parameter \
    --name "/oppijanumerorekisteri/VtjkyselyKeystorePassword" \
    --with-decryption \
    --profile "oph-yleiskayttoiset-$ENVIRONMENT" \
    --query Parameter.Value \
    --output text)"

  if [[ -z "$STOREPASS" || "$STOREPASS" == "None" ]]; then
    echo "Error: failed to fetch keystore password from SSM parameter '/oppijanumerorekisteri/VtjkyselyKeystorePassword'." >&2
    exit 1
  fi

  echo "Fetching secret from AWS Secrets Manager..."
  BASE64_JKS="$(aws secretsmanager get-secret-value \
    --secret-id "/oppijanumerorekisteri/VtjkyselyKeystoreBase64" \
    --profile "oph-yleiskayttoiset-$ENVIRONMENT" \
    --query SecretString \
    --output text)"

  if [[ -z "$BASE64_JKS" || "$BASE64_JKS" == "None" ]]; then
    echo "Error: no usable secret payload found in SecretString." >&2
    exit 1
  fi

  echo "Decoding keystore to $KEYSTORE_PATH..."
  printf '%s' "$BASE64_JKS" | base64 --decode > "$KEYSTORE_PATH"

  echo "Using alias: $ALIAS"

  OWNER_LINE="$(keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$STOREPASS" -alias "$ALIAS" \
    | sed -n 's/^Owner: //p' | head -n1)"

  if [[ -z "$OWNER_LINE" ]]; then
    echo "Error: failed to extract certificate subject (Owner) from keystore." >&2
    exit 1
  fi

  SUBJ="$(subject_to_openssl_subj "$OWNER_LINE")"
  if [[ -z "$SUBJ" ]]; then
    echo "Error: subject conversion failed." >&2
    exit 1
  fi

  echo "Generating passphrase for private key..."
  KEY_PASSPHRASE="$(openssl rand -base64 48 | tr -d '\n')"
  if [[ -z "$KEY_PASSPHRASE" ]]; then
    echo "Error: failed to generate private key passphrase." >&2
    exit 1
  fi
  (umask 077 && printf '%s' "$KEY_PASSPHRASE" > "$KEY_PASSPHRASE_PATH")

  echo "Generating 4096-bit RSA private key in PEM format (encrypted)..."
  openssl genpkey -algorithm RSA -aes-256-cbc -pass "file:$KEY_PASSPHRASE_PATH" \
    -pkeyopt rsa_keygen_bits:4096 -out "$KEY_PATH" >/dev/null 2>&1

  echo "Generating CSR with extracted subject (no CSR passphrase)..."
  openssl req -new -key "$KEY_PATH" -passin "file:$KEY_PASSPHRASE_PATH" -out "$CSR_PATH" -subj "$SUBJ"

  echo "Done."
  echo "Subject: $OWNER_LINE"
  echo "Private key: $KEY_PATH"
  echo "Private key passphrase: $KEY_PASSPHRASE_PATH"
  echo "CSR: $CSR_PATH"
}

main "$@"
