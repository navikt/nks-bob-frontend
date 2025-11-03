import * as amplitude from "@amplitude/analytics-browser"
import { Types } from "@amplitude/analytics-browser"

const getApiKey = () => {
  return window.location.hostname === "bob.ansatt.nav.no"
    ? "24311e1f03646352192aadd7b6fa08af"
    : "5560833e366c2488459da9762e892aa4"
}

type AmplitudeInstance = Pick<Types.BrowserClient, "logEvent" | "identify">
const createAmpltiudeInstance = (): AmplitudeInstance => {
  amplitude
    .init(getApiKey(), undefined, {
      serverUrl: "https://amplitude.nav.no/collect",
      useBatch: false,
      autocapture: {
        attribution: true,
        fileDownloads: false,
        formInteractions: false,
        pageViews: true,
        sessions: true,
        elementInteractions: false,
      },
    })
    .promise.catch((error) => {
      console.error("#MSA error initializing amplitude", error)
    })
  return amplitude
}

const mockedAmplitude = (): AmplitudeInstance => ({
  logEvent: (eventInput: Types.BaseEvent | string, eventProperties?: Record<string, any>) => {
    console.group("Mocked amplitude-event")
    console.table({ eventInput, ...eventProperties })
    console.groupEnd()
    return {
      promise: new Promise<Types.Result>((resolve) =>
        resolve({
          event: { event_type: "MockEvent" },
          code: 200,
          message: "Success: mocked amplitude-tracking",
        }),
      ),
    }
  },
  identify(identify: Types.IIdentify, _?: Types.EventOptions): Types.AmplitudeReturn<Types.Result> {
    console.group("Mocked amplitude-identify")
    console.table(identify)
    console.groupEnd()
    return {
      promise: new Promise<Types.Result>((resolve) =>
        resolve({
          event: { event_type: "MockIdentify" },
          code: 200,
          message: "Success: mocked amplitude-identify",
        }),
      ),
    }
  },
})

const instance = window.location.hostname === "localhost" ? mockedAmplitude() : createAmpltiudeInstance()

interface Umami {
  track(payload: unknown): void
  track(event_name: string, payload: unknown): void
  identify(session_data: unknown): void
}

declare global {
  interface Window {
    umami?: Umami
    environment?: {
      MILJO: string;
      NAIS_APP_IMAGE: string;
      GIT_COMMIT: string;
    }
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
  instance.logEvent(event, data)
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
}
