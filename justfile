[private]
default: help

[doc('Viser denne oversikten')]
help:
    just --list

[doc('Logg inn og hent miljøvariabler som trengs for lokal utvikling mot dev-gcp')]
setup: nais-login fetch-env

[doc('Kjør opp tjenester for lokal utvikling mot dev-gcp')]
[parallel]
localnais: port-forward wonderwall localnais-serve

[private]
nais-login:
    nais login

[private]
fetch-env:
	./hent-og-lagre-miljøvariabler.sh

[private]
port-forward:
	kubectl port-forward deployment/nks-bob-api 8989:8080

[private]
wonderwall:
	docker-compose up

[private]
localnais-serve:
	npm run localnais
