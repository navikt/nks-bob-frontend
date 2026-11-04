# NKS-Bob

Dette er en frontend-applikasjon vi kaller for NKS-Bob, som bruker React og Typescript.

NKS-Bob er en "språkgenereringsmodell", eller "språkbehandlingsassistent" som skal hjelpe veilederne i NKS med å besvare spørsmål fra brukere som ringer inn.

# Komme i gang

Vi bruker `pnpm` for håndtering av pakker. Den må først installeres hvis du allerede ikke har den. Det kan gjøres på en av følgende måter:

```sh
# med asdf (installerer automatisk versjon satt i .tool-versions)
asdf plugin add pnpm
asdf install pnpm

# med npm
npm install -g pnpm@<versjon>

# med homebrew
brew install pnpm
```

For å kjøre applikasjonen lokalt, må du først installere dependencies:

- pnpm install

og bygge prosjektet (før første gang)

- pnpm run build

Deretter starte development server:

- pnpm run dev

Dette vil starte en lokal utviklingsserver som du får tilgang til via nettleser på http://localhost:3000.

# Lokal utvikling mot dev-gcp

## Forutsetninger

Hemmeligheter for lokal utvikling ligger i en nais-managed secret (`nks-bob-frontend-lokal-credentials`) i NAIS Console.
Denne er allerede opprettet — du trenger ikke gjøre noe med den med mindre credentials har blitt rotert (skjer ca. årlig).
Ved rotasjon: oppdater secreten i [NAIS Console](https://console.nav.cloud.nais.io) → team `nks-aiautomatisering` → Secrets → `nks-bob-frontend-lokal-credentials` (dev).

## Oppsett

```sh
# Installer just om du ikke allerede har det
> brew install just

# Før aller første gang:
> chmod +x hent-og-lagre-miljøvariabler.sh

# Sett opp miljø (logger inn til nais og henter miljøvariabler):
> just setup

# Kjør tjenester for lokal utvikling
> just localnais

# gå til http://localhost:5173/
```

---

## Varsler om integrasjonssamtaler

Varsler er på ved lokal oppstart med `pnpm dev`, `pnpm localnais` eller
`just localnais`. Start den lokale serveren på nytt etter endringer i oppstartsskriptene.
Ved annen oppstart er varsler av som standard. Sett `CONVERSATION_NOTIFICATIONS_ENABLED=true` på
Express-serveren for å aktivere dem. Flaggene i `.nais/dev-gcp.yaml` og
`.nais/prod-gcp.yaml` er begge `false`. Aktiver i dev og verifiser funksjonen
før prod. Dette er runtime-konfigurasjon, ikke en Vite-variabel.

Nettleseren bruker én forbindelse per fane til
`/bob-api-ws/api/v2/conversations/notifications/ws`. Express håndterer
WebSocket-upgrade, henter et brukerbundet OBO-token gjennom eksisterende Texas-flyt
og videresender til `/api/v2/conversations/notifications/ws` i API-et.
Browser-cookies fjernes før videresending. Origin beholdes, og backend må
allerede tillate frontendens Origin. Deployede miljøer bruker `wss:`.
Ingen token sendes til nettleseren eller legges i URL eller subprotokoll.

`/bff/session` returnerer flaggen og, når den er aktivert, en pseudonym brukerreferanse,
utløpstid og et ugjennomsiktig kjennetegn for OBO-tokenets versjon. Responsen har
`Cache-Control: no-store`. Ruten gjenbruker innloggingen som Nais-sidecaren håndterer.
Når flaggen er av, trengs ingen tokenutveksling eller brukerdata.
I lokalt miljø brukes samme mock-tokenflyt som vanlig chat. Hvis mock-tokenet
mangler `oid` og `sub`, bruker sesjonsnøkkelen en hash av `NAVident`.
Dette gjelder bare `MILJO=local`, ikke `localnais`, dev eller prod.

En gyldig `ConversationCreated` gir en vedvarende beskjed og en lenke under
«Nye samtaler i denne økten» i varselmenyen. Lenken bruker `/samtaler/:conversationId`.
Mottak endrer ikke valgt samtale, fokus, utkast eller meldingsstrøm. Varslet betyr
at samtalen er opprettet, ikke at et KI-svar er ferdig.

Varslene finnes bare i minnet. De 100 siste beholdes til siden lastes på nytt
eller brukersesjonen skifter; visningen sier fra når eldre varsler fjernes.
Duplikater undertrykkes for de 1000 siste samtale-ID-ene, også etter reconnect.
Det finnes ingen replay eller varig ulest-status. Samtaler opprettet før
oppkobling eller under avbrudd kan derfor mangle varsel. Samtalelisten hentes
hendelsesstyrt via eksisterende SWR-cache, uten ny historikkvisning eller polling.

Klienten kontrollerer sesjonen ved oppstart, fokus/gjenopptakelse, nettverk tilbake,
reconnect og tokenutløp. Et kontobytte i en annen fane oppdages ved neste kontroll,
ikke øyeblikkelig. Gamle callbacks og pågående listekall sperres når brukeren skifter.
`1008` stopper vanlig retry; bare bekreftet fornyede credentials kan gi ett nytt
forsøk. Andre brudd bruker backoff med jitter mellom 1 og 30 sekunder. Backoff
nullstilles først etter 60 sekunder stabil forbindelse. Varslingskoden gjør ikke
automatisk redirect til innlogging.

### Tester og aktivering

Kjør `pnpm test`, `pnpm exec tsc -p server/tsconfig.json --noEmit` og `pnpm run build`.
Installer testnettleseren med `pnpm exec playwright install chromium` og kjør
`pnpm test:e2e` etter bygg. Nettlesertestene laster `dist/` gjennom Playwrights
request-mocking på `http://bob.test` og trenger ingen lokal HTTP-server.
Vitest dekker parser, cache, sesjonsbytte, retry-policy,
tilgjengelig visning og faktisk Express/WebSocket-proxy mot en syntetisk server.
Proxytestene bruker lokale Unix-sockets, uten ekte token eller eksterne tjenester.
Playwright bruker syntetiske REST-/WebSocket-svar; det beviser ikke backendens
eierskapskontroll eller Nais-ingressens oppførsel.

Før aktivering må teamet bekrefte backend-ruten på **alle API-podder** og verifisere
med syntetiske data i dev:

- To innloggede brukere: bare riktig eier får varsel.
- Opprettelse og varslingssocket på forskjellige API-podder.
- Flere faner, tokenutløp, nettverksbrudd og gjentatte policyavvisninger.
- Uendret vanlig chat og utkast mens varsler kommer.
- Tastatur, skjermleser, smal skjerm og lys/mørk visning.

Disse dev-kontrollene er manuelle aktiveringskrav, ikke del av de mockede testene.
Backend-kontrakten i `conversation_notifications.md` viser til commit `a7fa05d`;
tilgjengelig deployment må bekreftes separat. Endre ikke backend-auth,
Origin-allowlist eller accessPolicy for å omgå en avvist handshake.

### Drift og rollback

Se `conversation_notification_upgrades_total` og
`conversation_notification_connections` på eksisterende `/internal/metrics`.
Feilkategorier fra klienten går til eksisterende `/bff/log`, maksimalt én gang
per kategori i en brukersesjon. De inneholder ikke brukerdata, samtale-ID-er,
payload eller token. Ved vedvarende frakobling: kontroller først flaggen,
backend-versjonen, Origin og Texas/innlogging. Avtal alarmterskler etter målt trafikk.

Når backend avviser en WebSocket-oppgradering, logger BFF-en
`websocket:upstream-upgrade-rejected status=<HTTP-status>`. Loggen inneholder
ikke token, brukerdata eller responsinnhold. `101` betyr at forbindelsen er
oppgradert, ikke at backend har sendt en hendelse. Varslingsforbindelsen sender
ingen bekreftelsesmelding ved oppkobling og er stille frem til en ny
integrasjonssamtale opprettes. Vanlige meldinger og samtaler fra frontend
utløser ikke `ConversationCreated`.

Ved rollback skal frontend-abonnementet deaktiveres **før backend-ruten fjernes**.
Sett flaggen til `false` og gjennomfør en kontrollert frontend-restart/rollout slik
at åpne forbindelser lukkes. Klienter oppdager også flaggen ved neste sesjonskontroll;
en miljøendring alene skyver ikke beskjed til allerede åpne faner.
Kontroller at nye notification-upgrades stopper, og at vanlig chat fortsatt fungerer.
De separate dev-/prod-workflowene gir ikke automatisk dev-før-prod-aktivering.

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-nks-ai-og-automatisering.

Mer om teamet finner du her:
https://teamkatalog.nav.no/team/415e12bc-61fb-4579-840a-c9307765f2fc

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react"

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
})
```
