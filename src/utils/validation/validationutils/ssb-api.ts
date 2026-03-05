export const SSB_MALE_FIRST_NAMES_URL = "https://data.ssb.no/api/pxwebapi/v2/tables/10501/data?lang=no&outputFormat=json-stat2&valuecodes[ContentsCode]=*&valuecodes[Tid]=*&valuecodes[Fornavn]=*&codelist[Fornavn]=vs_NavnMenn01&heading=ContentsCode,Tid&stub=Fornavn"

export const SSB_FEMALE_FIRST_NAMES_URL =
  "https://data.ssb.no/api/pxwebapi/v2/tables/10501/data?lang=no&outputFormat=json-stat2&valuecodes[ContentsCode]=*&valuecodes[Tid]=*&valuecodes[Fornavn]=*&codelist[Fornavn]=vs_NavnKvinner01&heading=ContentsCode,Tid&stub=Fornavn"

  export const SSB_SURNAMES_URL = "https://data.ssb.no/api/pxwebapi/v2/tables/12891/data?lang=no&outputFormat=json-stat2&valuecodes[ContentsCode]=*&valuecodes[Tid]=*&valuecodes[Etternavn]=*&codelist[Etternavn]=vs_Etternavn01&heading=ContentsCode,Tid&stub=Etternavn"


  export type FirstNameResponse = {
  dimension: {
    Fornavn: {
      category: {
        label: Record<string, string>
      }
    }
  }
}

export type SurnameResponse = {
    dimension: {
        Etternavn: { category: { label: Record<string, string> }}
    }
}


let cachedFemaleFirstNames: Set<string> | null = null
let cachedMaleFirstNames: Set<string> | null = null
let cachedSurnames: Set<string> | null = null


export async function fetchFemaleFirstNamesFromSSB(): Promise<Set<string>> {
  if (cachedFemaleFirstNames) return cachedFemaleFirstNames

  const response = await fetch(SSB_FEMALE_FIRST_NAMES_URL)
  if (!response.ok) throw new Error(`SSB API error: ${response.status}`)

  const data: FirstNameResponse = await response.json()
  const labels = data.dimension.Fornavn.category.label

  cachedFemaleFirstNames = new Set(
    Object.values(labels).map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
  )

  return cachedFemaleFirstNames
}

export function getFemaleFirstNames(): Set<string> {
  return cachedFemaleFirstNames ?? new Set()
}

export function isKnownFemaleFirstName(word: string): boolean {
  const names = getFemaleFirstNames()
  return names.has(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}



export async function fetchMaleFirstNamesFromSSB(): Promise<Set<string>> {
  if (cachedMaleFirstNames) return cachedMaleFirstNames

  const response = await fetch(SSB_MALE_FIRST_NAMES_URL)
  if (!response.ok) throw new Error(`SSB API error: ${response.status}`)

  const data: FirstNameResponse = await response.json()
  const labels = data.dimension.Fornavn.category.label

  cachedMaleFirstNames = new Set(
    Object.values(labels).map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
  )

  return cachedMaleFirstNames
}

export function getMaleFirstNames(): Set<string> {
  return cachedMaleFirstNames ?? new Set()
}

export function isKnownMaleFirstName(word: string): boolean {
  const names = getMaleFirstNames()
  return names.has(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}



export async function fetchSurnamesFromSSB(): Promise<Set<string>> {
  if (cachedSurnames) return cachedSurnames

  const response = await fetch(SSB_SURNAMES_URL)
  if (!response.ok) throw new Error(`SSB API error: ${response.status}`)

  const data: SurnameResponse = await response.json()
  const labels = data.dimension.Etternavn.category.label

  cachedSurnames = new Set(
    Object.values(labels).map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
  )

  return cachedSurnames
}

export function getSurnames(): Set<string> {
  return cachedSurnames ?? new Set()
}

export function isKnownSurname(word: string): boolean {
  const names = getSurnames()
  return names.has(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}