# NKS-Bob

Dette er en frontend-applikasjon vi kaller for NKS-Bob, som bruker React og Typescript.

NKS-Bob er en "språkgenereringsmodell", eller "språkbehandlingsassistent" som skal hjelpe veilederne i NKS med å besvare spørsmål fra brukere som ringer inn.

# Komme i gang

Vi bruker `mise` til å installere Vite+. Vite+ velger Node.js-versjonen fra `.node-version` og pnpm-versjonen fra `devEngines.packageManager` i `package.json`. Installer mise hvis du ikke har det fra før, og kjør deretter:

```sh
mise install
```

Installer prosjektavhengighetene og bygg prosjektet første gang:

```sh
vp install
vp run build
```

Start deretter utviklingsserveren:

```sh
vp run dev
```

Serveren bruker `vp pack` med oppsettet i `server/vite.config.ts`.
Dev-scriptet bygger på nytt ved endringer og starter serveren etter hvert vellykket bygg.
Produksjonsbygget skriver serveren til `server/dist/server.js`.

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
