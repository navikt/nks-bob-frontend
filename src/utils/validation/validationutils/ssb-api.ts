const SSB_MALE_FIRST_NAMES_URL = "https://data.ssb.no/api/pxwebapi/v2/tables/10501/data?lang=no&outputFormat=json-stat2&valuecodes[ContentsCode]=*&valuecodes[Tid]=*&valuecodes[Fornavn]=*&codelist[Fornavn]=vs_NavnMenn01&heading=ContentsCode,Tid&stub=Fornavn"

const SSB_FEMALE_FIRST_NAMES_URL =
  "https://data.ssb.no/api/pxwebapi/v2/tables/10501/data?lang=no&outputFormat=json-stat2&valuecodes[ContentsCode]=*&valuecodes[Tid]=*&valuecodes[Fornavn]=*&codelist[Fornavn]=vs_NavnKvinner01&heading=ContentsCode,Tid&stub=Fornavn"

const SSB_SURNAMES_URL = "https://data.ssb.no/api/pxwebapi/v2/tables/12891/data?lang=no&outputFormat=json-stat2&valuecodes[ContentsCode]=*&valuecodes[Tid]=*&valuecodes[Etternavn]=*&codelist[Etternavn]=vs_Etternavn01&heading=ContentsCode,Tid&stub=Etternavn"


type FirstNameResponse = {
  dimension: {
    Fornavn: {
      category: {
        label: Record<string, string>
      }
    }
  }
}

type SurnameResponse = {
  dimension: {
    Etternavn: {
      category: {
        label: Record<string, string>
      }
    }
  }
}

let cachedFirstNames: Set<string> | null = null
let cachedSurnames: Set<string> | null = null

const nameFormat = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()

export async function fetchAllNamesFromSSB(): Promise<{ firstNames: Set<string>; surnames: Set<string> }> {
  if (cachedFirstNames && cachedSurnames) return { firstNames: cachedFirstNames, surnames: cachedSurnames }

  const [femaleFirstNamesRespons, maleFirstNamesRespons, surnamesRespons] = await Promise.all([
    fetch(SSB_FEMALE_FIRST_NAMES_URL),
    fetch(SSB_MALE_FIRST_NAMES_URL),
    fetch(SSB_SURNAMES_URL),
  ])

  if (!femaleFirstNamesRespons.ok) throw new Error(`SSB API error: ${femaleFirstNamesRespons.status}`)
  if (!maleFirstNamesRespons.ok) throw new Error(`SSB API error: ${maleFirstNamesRespons.status}`)
  if (!surnamesRespons.ok) throw new Error (`SSB API error: ${surnamesRespons.status}`)

  const femaleData: FirstNameResponse = await femaleFirstNamesRespons.json()
  const maleData: FirstNameResponse = await maleFirstNamesRespons.json()
  const surnameData: SurnameResponse = await surnamesRespons.json()

  cachedFirstNames = new Set(
    [...Object.values(femaleData.dimension.Fornavn.category.label),
      ...Object.values(maleData.dimension.Fornavn.category.label)
    ].map(nameFormat)
  )

  cachedSurnames = new Set(
    Object.values(surnameData.dimension.Etternavn.category.label).map(nameFormat)
  )

  return { firstNames: cachedFirstNames, surnames: cachedSurnames }
}

function getAllNames(): Set<string> {
  return new Set([...(cachedFirstNames ?? []), ...(cachedSurnames ?? [])])
}

export function isKnownNames(name: string): boolean {
  return getAllNames().has(nameFormat(name))
}