.DEFAULT_GOAL := help

help:
	@echo 'Tilgjengelige kommandoer'
	@echo "setup\t\t-\tklargjør lokal utvikling mot dev-gcp"
	@echo "localnais\t-\tutvikling lokalt mot dev-gcp"

setup: nais-login fetch-env

localnais: port-forward wonderwall localnais-serve

nais-login:
	@nais login

fetch-env:
	@./hent-og-lagre-miljøvariabler.sh

port-forward:
	@kubectl port-forward deployment/nks-bob-api 8989:8080 &

wonderwall:
	@docker-compose up &

localnais-serve:
	@npm run localnais
