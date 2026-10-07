# NKS-Bob

NKS-Bob er en språkbehandlingsassistent som hjelper veiledere i NKS med å svare på spørsmål fra brukere.

## Komme i gang

Installer mise hvis du ikke har det fra før. Installer deretter Vite+ og prosjektets verktøy:

```sh
mise install
```

Installer prosjektavhengighetene og bygg prosjektet første gang:

```sh
vp install
vp run build
```

Start utviklingsserverne:

```sh
vp run dev
```

Frontend-serveren starter på http://localhost:5173. Serveren bruker `vp pack` med oppsettet i `server/vite.config.ts`. I dev-modus bygges serveren på nytt ved endringer og startes etter hvert vellykket bygg.

## Lokal utvikling mot dev-gcp

### Forutsetninger

Hemmeligheter for lokal utvikling ligger i den NAIS-administrerte secreten `nks-bob-frontend-lokal-credentials` i NAIS Console. Secreten er allerede opprettet. Ved rotasjon oppdaterer du den i [NAIS Console](https://console.nav.cloud.nais.io) under teamet `nks-aiautomatisering` → Secrets → `nks-bob-frontend-lokal-credentials` (dev).

### Oppsett

```sh
# Logg inn til nais og hent miljøvariabler
mise run setup

# Start tjenestene for lokal utvikling
mise run localnais
```

Åpne http://localhost:5173/.

## Henvendelser

Opprett et issue i GitHub hvis du har spørsmål om koden eller prosjektet.

### For Nav-ansatte

Send interne henvendelser i Slack-kanalen #team-nks-ai-og-automatisering.

Du finner mer informasjon om teamet i [teamkatalogen](https://teamkatalog.nav.no/team/415e12bc-61fb-4579-840a-c9307765f2fc).
