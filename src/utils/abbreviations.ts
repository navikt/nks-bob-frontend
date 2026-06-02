export const ABBREVIATIONS: Record<string, string> = {
  aap: "Arbeidsavklaringspenger",
  afp: "Avtalefestet pensjon",
  ag: "Arbeidsgiver",
  agp: "arbeidsgiverperiode",
  "amo-kurs": "Arbeidsmarkedsopplæring",
  ap: "Alderspensjon",
  "aa-registeret": "Arbeidsgiver-og arbeidstakerregisteret",
  ba: "Bidragsbarn",
  bht: "Bedriftshelsetjenesten",
  bm: "Bidragsmottaker",
  bp: "Bidragspliktig",
  dp: "Dagpenger",
  eessi: "Electronic Exchange of Social Security Information",
  eures: "European employment services",
  fa: "Familie",
  fp: "Foreldrepenger",
  freg: "Folkeregisteret",
  ftrl: "Folketrygdloven",
  gh: "Grunn- og hjelpestønad",
  ia: "Inkluderende arbeidsliv",
  io: "Inntektsopplysninger",
  im: "Inntektsmelding",
  ka: "Klageinstans",
  klp: "Kommunal Landspensjonskasse",
  krr: "Kontakt- og reservasjonsregisteret",
  kvp: "Kvalifiseringsprogrammet",
  mk: "Meldekort",
  navi: "Nav Innkreving",
  nay: "Nav Arbeid og ytelser",
  nfp: "Nav Familie og pensjon",
  nøp: "Nav Økonomi Pensjon",
  nøs: "Nav Økonomi Stønad",
  ogs: "Overgangsstønad",
  pdu: "Attest som kan gi unntak fra krav om opphold i Norge for dagpengemottaker",
  pe: "Pensjon",
  pl: "Pleiepenger",
  rm: "Reell mottaker",
  rol: "Rådgivende overlege",
  sbt: "Saksbehandlingstid",
  sed: "Strukturerte elektroniske dokumenter",
  sm: "Sykmelding",
  sn: "Selvstendig næringsdrivende",
  sosp: "Søknad om sykepenger",
  sp: "Sykepenger",
  spk: "Statens Pensjonskasse",
  ssb: "Statistisk sentralbyrå",
  st: "Sosiale tjenester",
  "tp-ordning": "Tjenestepensjonsordning",
  "tt-kort": "Tilrettelagt transport",
  vta: "Varig tilrettelagt arbeid",
}

export function getAbbreviationSuggestion(text: string): { abbr: string; expansion: string } | null {
  const match = text.match(/(?:^|\s)([a-zA-Z0-9øæåØÆÅ][a-zA-Z0-9øæåØÆÅ-]*)$/)
  if (!match) return null
  const word = match[1].toLowerCase()
  if (ABBREVIATIONS[word]) {
    return { abbr: word, expansion: ABBREVIATIONS[word] }
  }
  return null
}

const TRIGGERS = new Set([" ", ",", ".", "-", "!", "?"])

export function expandAbbreviationInText(text: string): string | null {
  if (text.length === 0) return null
  const lastChar = text[text.length - 1]
  if (!TRIGGERS.has(lastChar)) return null

  const beforeTrigger = text.slice(0, -1)
  const match = beforeTrigger.match(/(?:^|\s)([a-zA-Z0-9øæåØÆÅ][a-zA-Z0-9øæåØÆÅ-]*)$/)
  if (!match) return null

  const word = match[1].toLowerCase()
  if (!ABBREVIATIONS[word]) return null

  return beforeTrigger.slice(0, match.index! + (match[0].length - match[1].length)) + ABBREVIATIONS[word] + lastChar
}