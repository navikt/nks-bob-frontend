#!/bin/bash

SECRET_NAME="nks-bob-frontend-lokal-credentials"
TEAM="nks-aiautomatisering"

NKS_BOB_FRONTEND_LOKAL_SECRETS=$(nais secret get "$SECRET_NAME" \
  -t "$TEAM" \
  -e dev-gcp \
  --with-values \
  --reason "Henter miljøvariabler for lokal utvikling" \
  -o json 2>&1)

if [ $? -ne 0 ] || [ -z "$NKS_BOB_FRONTEND_LOKAL_SECRETS" ] || ! echo "$NKS_BOB_FRONTEND_LOKAL_SECRETS" | jq . > /dev/null 2>&1
then
      echo "Klarte ikke å hente miljøvariabler."
      echo "Er du pålogget med 'nais auth login'?"
      echo ""
      echo "Hvis secreten ikke finnes, må den opprettes i NAIS Console:"
      echo "  https://console.nav.cloud.nais.io → $TEAM → Secrets → Opprett '$SECRET_NAME' (dev)"
      echo "  Med nøklene: AZURE_APP_CLIENT_ID, AZURE_APP_JWK, AZURE_APP_WELL_KNOWN_URL,"
      echo "  AZURE_OPENID_CONFIG_JWKS_URI, AZURE_OPENID_CONFIG_ISSUER, AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"
      exit 1
fi

# nais secret get JSON: {"data": [{"key": "NAME", "value": "..."}]}
function copy_envvar() {
  local value=$(echo "$NKS_BOB_FRONTEND_LOKAL_SECRETS" | jq -r --arg k "$1" '.data[] | select(.key == $k) | .value // empty')
  if [ -z "$value" ]; then
    echo "ADVARSEL: Fant ikke nøkkel '$1' i secreten '$SECRET_NAME'" >&2
    return 1
  fi
  echo "$1='$value'"
}

# Generate random 32 character strings for the cookie and session keys
COOKIE_KEY1=$(openssl rand -hex 16)
COOKIE_KEY2=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 16)

# Write the variables into the .env file
cat << EOF > .login.env
# Denne filen er generert automatisk ved å kjøre \`hent-og-lagre-miljøvariabler.sh\`

`copy_envvar AZURE_APP_CLIENT_ID`
`copy_envvar AZURE_APP_JWK`
`copy_envvar AZURE_APP_WELL_KNOWN_URL`
`copy_envvar AZURE_OPENID_CONFIG_JWKS_URI`
`copy_envvar AZURE_OPENID_CONFIG_ISSUER`
`copy_envvar AZURE_OPENID_CONFIG_TOKEN_ENDPOINT`
EOF

# Write the variables into the .env file
cat << EOF > server/.env
# Denne filen er generert automatisk ved å kjøre \`hent-og-lagre-miljøvariabler.sh\`

COOKIE_KEY1='$COOKIE_KEY1'
COOKIE_KEY2='$COOKIE_KEY2'
SESSION_SECRET='$SESSION_SECRET'
NAIS_TOKEN_ENDPOINT=http://localhost:4001/api/v1/token
NAIS_TOKEN_EXCHANGE_ENDPOINT=http://localhost:4001/api/v1/token/exchange
NAIS_TOKEN_INTROSPECTION_ENDPOINT=http://localhost:4001/api/v1/introspect
LOGIN_URL=http://localhost:4000/oauth2/login
EOF
