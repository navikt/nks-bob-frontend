[private]
default: help

[doc('Viser denne oversikten')]
help:
    just --list

[doc('Logg inn og hent miljøvariabler som trengs for lokal utvikling mot dev-gcp')]
setup: nais-login fetch-env

[doc('Kjør opp tjenester for lokal utvikling mot dev-gcp')]
localnais: check-ports
    just _localnais-run

[private]
[parallel]
_localnais-run: port-forward localnais-serve wonderwall

[doc('Stopp alle localnais-tjenester og frigjør porter')]
stop:
    -docker-compose down
    -lsof -ti :4000 | xargs kill -9 2>/dev/null || true
    -lsof -ti :4001 | xargs kill -9 2>/dev/null || true
    -lsof -ti :8989 | xargs kill -9 2>/dev/null || true
    @echo "Alle localnais-tjenester stoppet"

[private]
check-ports:
    #!/usr/bin/env bash
    set -e
    for port in 4000 4001 8989; do
        if lsof -ti :$port > /dev/null 2>&1; then
            echo "FEIL: Port $port er allerede i bruk av prosess $(lsof -ti :$port)."
            echo "Kjør 'just stop' for å frigjøre porter, deretter prøv igjen."
            exit 1
        fi
    done

[private]
nais-login:
    nais auth login

[private]
fetch-env:
	./hent-og-lagre-miljøvariabler.sh

[private]
port-forward:
	kubectl port-forward --cluster dev-gcp --namespace nks-aiautomatisering deployment/nks-bob-api 8989:8080

[private]
wonderwall:
	docker-compose up

[private]
localnais-serve:
	pnpm run localnais
