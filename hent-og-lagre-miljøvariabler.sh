#!/bin/bash

kubectl config use-context dev-gcp

function get_secrets() {
  local repo=$1
  kubectl -n nks-aiautomatisering get secret ${repo} -o json | jq '.data | map_values(@base64d)'
}

NKS_BOB_FRONTEND_LOKAL_SECRETS=$(get_secrets azuread-nks-bob-frontend-lokal)

if [ -z "$NKS_BOB_FRONTEND_LOKAL_SECRETS" ]
then
      echo "Klarte ikke å hente miljøvariabler. Er du pålogget Naisdevice og google?"
      exit 1
fi

function copy_envvar() {
  echo "$1='$(echo $NKS_BOB_FRONTEND_LOKAL_SECRETS | jq -r .$1)'"
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
