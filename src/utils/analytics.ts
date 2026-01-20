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

const svarEndret = (endring: "oversett" | "punktliste" | "empatisk") => logEvent("Svar endret", { endring })

const feilMeldt = (meldingsId: string) => logEvent("Feil meldt", { meldingsId })

const infoÅpnet = () => logEvent("Info modal åpnet")

const mørkModusByttet = (modus: "lys" | "mørk") => logEvent("Mørk modus byttet", { modus })

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

const åpnetFotnote = () => logEvent("Fotnote åpnet")

const nySamtalePgaVarsel = () => logEvent("Startet ny samtale pga varsel")

const lukketNySamtaleVarsel = () => logEvent("Lukket ny samtale varsel")

const kbSitatLenkeKlikket = (kontekst: KontekstArtikkelMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("KB-sitat-lenke åpnet", { kontekst, sitat, verktøykall })

const kbSitatTittelKopiert = (kontekst: KontekstArtikkelMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("KB-sitat-tittel kopiert", { kontekst, sitat, verktøykall })

const navSitatLenkeKlikket = (kontekst: KontekstMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("Nav-sitat-lenke åpnet", { kontekst, sitat, verktøykall })

const navSitatLenkeKopiert = (kontekst: KontekstMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("KB-sitat-lenke kopiert", { kontekst, sitat, verktøykall })

const navModalLenkeKlikket = (kontekst: KontekstMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("Nav-lenke i modal klikket", { kontekst, sitat, verktøykall })

const navModalLenkeKopiert = (kontekst: KontekstMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("Nav-lenke i modal kopiert", { kontekst, sitat, verktøykall })

const kbModalLenkeKlikket = (kontekst: KontekstArtikkelMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("KB-lenke i modal klikket", { kontekst, sitat, verktøykall })

const kbModalLenkeKopiert = (kontekst: KontekstArtikkelMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("KB-lenke i modal kopiert", { kontekst, sitat, verktøykall })

const navVisAlleKilderLenkeKlikket = (kontekst: KontekstMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("Nav-lenke under 'alle kilder' klikket", { kontekst, sitat, verktøykall })

const navVisAlleKilderLenkeKopiert = (kontekst: KontekstMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("Nav-lenke under 'alle kilder' kopiert", { kontekst, sitat, verktøykall })

const kbVisAlleKilderLenkeKlikket = (kontekst: KontekstArtikkelMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("KB-lenke under 'alle kilder' klikket", { kontekst, sitat, verktøykall })

const kbVisAlleKilderLenkeKopiert = (kontekst: KontekstArtikkelMeta, sitat: SitatMeta, verktøykall: string[]) =>
  logEvent("KB-lenke under 'all kilder' kopiert", { kontekst, sitat, verktøykall })

const versjonOppdatert = (gammelVersjon: string, nyVersjon: string) =>
  logEvent("Bob versjon oppdatert", { gammelVersjon, nyVersjon })

const versjonLagret = (versjon: string) => logEvent("Versjon av Bob brukt", { versjon })

const nySamtaleOpprettet = (samtaleId: string) => logEvent("Ny samtale opprettet", { samtaleId })

const svartekstMarkert = () => logEvent("Svartekst markert og kopiert")

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
}
