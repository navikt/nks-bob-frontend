import { it, expect, describe } from "vitest"
import { createTextFragment, encodeFragment } from "./text-fragment"
import { Citation } from "../types/Message"

const citation = (text: string): Citation => ({
  text,
  sourceId: 0,
})

const fragment = (textStart: string, textEnd: string): string =>
  `${encodeFragment(textStart)},${encodeFragment(textEnd)}`

const testCases: [Citation, string][] = [
  [
    citation("Du finner informasjon om hvordan du søker om dagpenger på [nav.no/dagpenger\\#sok](https://www.nav.no/dagpenger#sok)"),
    fragment("Du finner informasjon om hvordan", "du søker om dagpenger på"),
  ],
  [
    citation("Du kan lese om hvem som kan få dagpenger på [nav.no/dagpenger\\#hvem](http://www.nav.no/dagpenger#hvem)"),
    fragment("Du kan lese om hvem", "som kan få dagpenger på"),
  ],
]

describe.each(testCases)("Text fragment", (citation, expectedFragment) => {
  it(`citation with text "${citation.text}" should create fragment "${expectedFragment}"`, () => {
    expect(createTextFragment(citation)).toBe(expectedFragment)
  })
})
