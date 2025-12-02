interface Umami {
  track(payload: unknown): void
  track(event_name: string, payload: unknown): void
  identify(session_data: unknown): void
}

declare global {
  interface Window {
    umami?: Umami
  }
}

async function umamiTrack(event: string, data?: Record<string, unknown>) {
  if (window.location.hostname === "localhost") {
    console.info(`[DEV] hendelse sporet: ${event}`, data)
    return
  }

  return window.umami ? window.umami.track(event, data) : Promise.resolve()
}

const logEvent = (event: string, data?: Record<string, unknown>) => {
  umamiTrack(event, data)
}

const svarKopiert = (meldingsId: string) => logEvent("Svar kopiert", { meldingsId })

const svarEndret = (endring: "oversett" | "punktliste" | "forenkle") => logEvent("Svar endret", { endring })

const feilMeldt = (meldingsId: string) => logEvent("Feil meldt", { meldingsId })

const infoÅpnet = () => logEvent("Info modal åpnet")

const mørkModusByttet = (modus: "lys" | "mørk") => logEvent("Mørk modus byttet", { modus })

const meldingSendt = (trigger: "knapp" | "enter") => logEvent("Melding sendt", { trigger })

const kildeAccordionÅpnet = () => logEvent("Kilde accordion åpnet")

const kildeAccordionSkjult = () => logEvent("Kilde accordion skjult")

const tekstInnholdLimtInn = () => logEvent("Tekstinnhold limt inn")

const tekstInneholderFnr = () => logEvent("Tekst inneholder fnr")

const forslagTrykket = () => logEvent("Forslag trykket")

const visAlleKilderÅpnet = () => logEvent("Vis alle kilder åpnet")

const spørsmålRedigert = () => logEvent("Rediger spørsmål trykket")

const åpnetFotnote = () => logEvent("Fotnote åpnet")

const nySamtalePgaVarsel = () => logEvent("Startet ny samtale pga varsel")

const lukketNySamtaleVarsel = () => logEvent("Lukket ny samtale varsel")

const kbSitatLenkeKlikket = () => logEvent("KB-sitat-lenke åpnet")

const kbSitatTittelKopiert = () => logEvent("KB-sitat-tittel kopiert")

const navSitatLenkeKlikket = () => logEvent("Nav-sitat-lenke åpnet")

const navSitatLenkeKopiert = () => logEvent("KB-sitat-lenke kopiert")

const navModalLenkeKlikket = () => logEvent("Nav-lenke i modal klikket")

const navModalLenkeKopiert = () => logEvent("Nav-lenke i modal kopiert")

const kbModalLenkeKlikket = () => logEvent("KB-lenke i modal klikket")

const kbModalLenkeKopiert = () => logEvent("KB-lenke i modal kopiert")

const navVisAlleKilderLenkeKlikket = () => logEvent("Nav-lenke under 'alle kilder' klikket")

const navVisAlleKilderLenkeKopiert = () => logEvent("Nav-lenke under 'alle kilder' kopiert")

const kbVisAlleKilderLenkeKlikket = () => logEvent("KB-lenke under 'alle kilder' klikket")

const kbVisAlleKilderLenkeKopiert = () => logEvent("KB-lenke under 'all kilder' kopiert")

const versjonOppdatert = (gammelVersjon: string, nyVersjon: string) =>
  logEvent("Bob versjon oppdatert", { gammelVersjon, nyVersjon })

const versjonLagret = (versjon: string) => logEvent("Versjon av Bob brukt", { versjon })

export default {
  svarKopiert,
  svarEndret,
  feilMeldt,
  infoÅpnet,
  mørkModusByttet,
  meldingSendt,
  kildeAccordionÅpnet,
  kildeAccordionSkjult,
  tekstInnholdLimtInn,
  tekstInneholderFnr,
  forslagTrykket,
  visAlleKilderÅpnet,
  spørsmålRedigert,
  åpnetFotnote,
  nySamtalePgaVarsel,
  lukketNySamtaleVarsel,
  kbSitatLenkeKlikket,
  navSitatLenkeKlikket,
  kbSitatTittelKopiert,
  navSitatLenkeKopiert,
  navModalLenkeKlikket,
  navModalLenkeKopiert,
  kbModalLenkeKlikket,
  kbModalLenkeKopiert,
  navVisAlleKilderLenkeKlikket,
  navVisAlleKilderLenkeKopiert,
  kbVisAlleKilderLenkeKlikket,
  kbVisAlleKilderLenkeKopiert,
  versjonOppdatert,
  versjonLagret,
}
