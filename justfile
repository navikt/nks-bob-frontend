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

[doc('Hent Azure-credentials fra cluster (bruk ved rotasjon eller etter at appen ble re-opprettet)')]
dump-credentials:
    #!/usr/bin/env bash
    set -e
    NAMESPACE="nks-aiautomatisering"
    SECRET="azuread-nks-bob-frontend-lokal"
    JOB="dump-lokal-credentials"

    echo "Oppretter jobb for å hente credentials fra '$SECRET'..."
    kubectl apply --cluster dev-gcp -f - <<EOF
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: $JOB
      namespace: $NAMESPACE
    spec:
      ttlSecondsAfterFinished: 60
      template:
        spec:
          securityContext:
            runAsNonRoot: true
            runAsUser: 65532
            seccompProfile:
              type: RuntimeDefault
          containers:
          - name: dump
            image: gcr.io/distroless/base-debian12:debug
            command: ["/busybox/sh", "-c", "env | grep -E 'AZURE_APP_(CLIENT_ID|JWK|WELL_KNOWN_URL)|AZURE_OPENID_CONFIG'"]
            envFrom:
            - secretRef:
                name: $SECRET
            resources:
              limits:
                memory: 64Mi
              requests:
                cpu: 10m
                memory: 32Mi
            securityContext:
              allowPrivilegeEscalation: false
              readOnlyRootFilesystem: true
              capabilities:
                drop: ["ALL"]
          restartPolicy: Never
      backoffLimit: 0
    EOF

    echo "Venter på at jobben skal fullføre..."
    kubectl wait --cluster dev-gcp -n $NAMESPACE --for=condition=complete job/$JOB --timeout=30s

    echo ""
    echo "=== Credentials fra $SECRET ==="
    kubectl logs --cluster dev-gcp -n $NAMESPACE job/$JOB
    echo "================================"
    echo ""
    echo "Oppdater 'nks-bob-frontend-lokal-credentials' i NAIS Console (dev) med verdiene over,"
    echo "og kjør deretter 'just setup' på nytt."

    kubectl delete --cluster dev-gcp -n $NAMESPACE job/$JOB

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
