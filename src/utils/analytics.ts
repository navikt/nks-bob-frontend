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

type KontekstMeta = { tittel: string; kilde: "navno" | "nks" }

type KontekstArtikkelMeta = KontekstMeta & { artikkelKolonne: string | null }

type SitatMeta = { kildeId: number }

function reduceToObject<T>(acc: { [key: number]: T }, current: T, index: number) {
  acc[index] = current
  return acc
}

const svarKopiert = (meldingsId: string) => logEvent("Svar kopiert", { meldingsId })

const svarEndret = (endring: "oversett" | "punktliste" | "empatisk" | "du-form") => logEvent("Svar endret", { endring })

const feilMeldt = (meldingsId: string) => logEvent("Feil meldt", { meldingsId })

const infoÅpnet = () => logEvent("Info modal åpnet")

const mørkModusByttet = (modus: "lys" | "mørk" | "system") => logEvent("Mørk modus byttet", { modus })

const meldingSendt = (trigger: "knapp" | "enter" | "hotkey", antallTegn: number) =>
  logEvent("Melding sendt", { trigger, antallTegn })

const svarMottatt = (
  meldingsId: string,
  antallTegn: number,
  kontekst: KontekstMeta[],
  sitater: SitatMeta[],
  verktøykall: string[],
) =>
  logEvent("Svar mottatt", {
    meldingsId,
    antallTegn,
    kontekst: kontekst.reduce(reduceToObject<KontekstMeta>, {}),
    sitater: sitater.reduce(reduceToObject<SitatMeta>, {}),
    verktøykall,
  })

const kildeAccordionÅpnet = () => logEvent("Kilde accordion åpnet")

const kildeAccordionSkjult = () => logEvent("Kilde accordion skjult")

const tekstInnholdLimtInn = () => logEvent("Tekstinnhold limt inn")

const tekstInneholderFnr = () => logEvent("Tekst inneholder fnr")

const valideringsfeil = (level: "warning" | "error", type: string) => logEvent("Valideringsfeil", { level, type })

const forslagTrykket = () => logEvent("Forslag trykket")

const visAlleKilderÅpnet = () => logEvent("Vis alle kilder åpnet")

const spørsmålRedigert = () => logEvent("Rediger spørsmål trykket")

const åpnetFotnote = (kontekst: KontekstArtikkelMeta) => logEvent("Fotnote åpnet", { kontekst })

const nySamtalePgaVarsel = () => logEvent("Startet ny samtale pga varsel")

const lukketNySamtaleVarsel = () => logEvent("Lukket ny samtale varsel")

const kbSitatLenkeKlikket = (kontekst: KontekstArtikkelMeta) => logEvent("KB-sitat-lenke åpnet", { kontekst })

const kbSitatTittelKopiert = (kontekst: KontekstArtikkelMeta) => logEvent("KB-sitat-tittel kopiert", { kontekst })

const navSitatLenkeKlikket = (kontekst: KontekstMeta) => logEvent("Nav-sitat-lenke åpnet", { kontekst })

const navSitatLenkeKopiert = (kontekst: KontekstMeta) => logEvent("KB-sitat-lenke kopiert", { kontekst })

const navModalLenkeKlikket = (kontekst: KontekstMeta) => logEvent("Nav-lenke i modal klikket", { kontekst })

const navModalLenkeKopiert = (kontekst: KontekstMeta) => logEvent("Nav-lenke i modal kopiert", { kontekst })

const kbModalLenkeKlikket = (kontekst: KontekstArtikkelMeta) => logEvent("KB-lenke i modal klikket", { kontekst })

const kbModalLenkeKopiert = (kontekst: KontekstArtikkelMeta) => logEvent("KB-lenke i modal kopiert", { kontekst })

const navVisAlleKilderLenkeKlikket = (kontekst: KontekstMeta) =>
  logEvent("Nav-lenke under 'alle kilder' klikket", { kontekst })

const navVisAlleKilderLenkeKopiert = (kontekst: KontekstMeta) =>
  logEvent("Nav-lenke under 'alle kilder' kopiert", { kontekst })

const kbVisAlleKilderLenkeKlikket = (kontekst: KontekstArtikkelMeta) =>
  logEvent("KB-lenke under 'alle kilder' klikket", { kontekst })

const kbVisAlleKilderLenkeKopiert = (kontekst: KontekstArtikkelMeta) =>
  logEvent("KB-lenke under 'all kilder' kopiert", { kontekst })

const versjonOppdatert = (gammelVersjon: string, nyVersjon: string) =>
  logEvent("Bob versjon oppdatert", { gammelVersjon, nyVersjon })

const versjonLagret = (versjon: string) => logEvent("Versjon av Bob brukt", { versjon })

const nySamtaleOpprettet = (samtaleId: string) =>
  logEvent("Ny samtale opprettet", {
    samtaleId,
    screen: {
      innerWidth,
      innerHeight,
    },
  })

// andel markert mellom 0 og 1
const svartekstMarkert = (andelMarkert: number) => logEvent("Svartekst markert og kopiert", { andelMarkert })

const fotnoteLenkeKlikket = (kontekst: KontekstArtikkelMeta) => logEvent("Fotnote-lenke klikket", { kontekst })

export default {
  svarKopiert,
  svarEndret,
  feilMeldt,
  infoÅpnet,
  mørkModusByttet,
  meldingSendt,
  svarMottatt,
  kildeAccordionÅpnet,
  kildeAccordionSkjult,
  tekstInnholdLimtInn,
  tekstInneholderFnr,
  valideringsfeil,
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
  nySamtaleOpprettet,
  svartekstMarkert,
  fotnoteLenkeKlikket,
}
