import { Citation } from "../types/Message"

export function createTextFragment(citation: Citation): string | null {
  // Splitting words, making it functional for textStart & textEnd //
  const citeWords = citation.text
    .replace(/\n\n|\n/g, " ")
    .split(" ")
    .filter((link) => !/https?/.test(link))

  // Min- and max count of words for the 6 (max) first- and last words in the citation //
  const numWords = Math.min(citeWords.length / 2, 6)
  const textStart = citeWords.slice(0, numWords).join(" ")
  const textEnd = citeWords.slice(-numWords).join(" ")

  if (numWords < 1) {
    return null
  }

  return `${encodeFragment(textStart)},${encodeFragment(textEnd)}`
}

// Encoding for RFC3986 - making text fragments to work for citations with unreserved marks //
export function encodeFragment(text: string) {
  return encodeURIComponent(text).replace(
    /[-!'()*#]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}
