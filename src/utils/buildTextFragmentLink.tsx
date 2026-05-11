import { Context } from "../types/Message"
import { transformArticleColumnValue } from "./articleColumnTransformer"

export const buildTextFragmentLink = (text: string, context: Context, anchor?: string) => {
  function stripHeadingLines(value: string) {
    return value
      .replace(/^\s*#{1,6}\s+.*$/gm, "")
      .replace(/^\s*\*{1,3}[^*\n]+\*{1,3}\s*$/gm, "")
      .trim()
  }

  function processTextForBlocks(text: string) {
    const textWithoutHeadings = stripHeadingLines(text)
    const blockSeparators = [/\n\s*\n/g, /\n\s*[-•·‣⁃*]\s*/g, /\n\s*\d+\.\s*/g, /\n\s*#{1,6}\s*/g, /\n\s*>\s*/g]

    let blocks = [textWithoutHeadings]

    blockSeparators.forEach((separator) => {
      blocks = blocks.flatMap((block) => block.split(separator).filter((part) => part.trim().length > 0))
    })

    const cleanedBlocks = blocks
      .map((block) =>
        block
          .replace(/^[-•·‣⁃*]\s*/g, "")
          .replace(/\n\s*[-•·‣⁃*]\s*/g, " ")
          .replace(/[•·‣⁃*]/g, "")
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .replace(/^\s{0,3}#{1,6}\s+/gm, "")
          .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
          .trim(),
      )
      .filter((block) => block.length > 0)

    return cleanedBlocks
  }

  const textBlocks = processTextForBlocks(text)
  if (textBlocks.length <= 1) {
    const textWithoutHeadings = stripHeadingLines(text)
    const citeWords = textWithoutHeadings
      .replace(/\n\n|\n/g, " ")
      .replace(/^[-•·‣⁃*]\s*/g, "")
      .replace(/\n\s*[-•·‣⁃*]\s*/g, " ")
      .replace(/[•·‣⁃*]/g, "")
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((word) => !/https?/.test(word) && word.length > 0)

    const totalWords = citeWords.length

    if (totalWords <= 6) {
      const textStart = citeWords.join(" ")
      return buildLinkWithTextFragments(textStart, "")
    }

    let numWords
    if (totalWords <= 10) {
      numWords = Math.max(Math.min(totalWords - 2, 8), 3)
    } else if (totalWords <= 20) {
      numWords = Math.min(totalWords / 3, 8)
    } else {
      numWords = Math.min(totalWords / 2, 6)
    }

    const textStart = citeWords.slice(0, numWords).join(" ")
    const textEnd = citeWords.slice(-numWords).join(" ")

    return buildLinkWithTextFragments(textStart, textEnd)
  }

  const firstBlock = textBlocks[0]
  const lastBlock = textBlocks[textBlocks.length - 1]

  const firstBlockWords = firstBlock.split(" ").filter((word) => word.length > 0)
  const lastBlockWords = lastBlock.split(" ").filter((word) => word.length > 0)

  const firstBlockTotalWords = firstBlockWords.length
  const lastBlockTotalWords = lastBlockWords.length

  const maxWordsFromFirstBlock =
    firstBlockTotalWords <= 6 ? Math.max(firstBlockTotalWords, 3) : Math.min(firstBlockTotalWords, 6)
  const textStart = firstBlockWords.slice(0, maxWordsFromFirstBlock).join(" ")

  const maxWordsFromLastBlock =
    lastBlockTotalWords <= 6 ? Math.max(lastBlockTotalWords, 3) : Math.min(lastBlockTotalWords, 6)
  const textEnd = lastBlockWords.slice(-maxWordsFromLastBlock).join(" ")

  function buildLinkWithTextFragments(start: string, end: string) {
    function encodeFragment(text: string) {
      return encodeURIComponent(text).replace(/[-!'()*#]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    }

    const expandAll = context?.source === "navno" ? "?expandall=true" : ""
    const useAnchor = anchor ?? context?.url.includes("/saksbehandlingstider")

    const textFragment = end && end.trim() ? `${encodeFragment(start)},${encodeFragment(end)}` : encodeFragment(start)

    const transformedArticleColumn = context.articleColumn
      ? transformArticleColumnValue(context.articleColumn)
      : undefined

    const navnoAnchor = context?.anchor ? `${context.anchor}` : ""

    const navnoHref = navnoAnchor
      ? `${context.url}${expandAll}#${navnoAnchor}:~:text=${textFragment}`
      : `${context.url}${expandAll}#:~:text=${textFragment}`

    return context.source === "navno" && !useAnchor
      ? navnoHref
      : useAnchor
        ? `${context.url}${expandAll}#${anchor ?? context.anchor}`
        : !start || start.trim().length === 0
          ? `${context.url}`
          : transformedArticleColumn
            ? `${context.url}${expandAll}#${transformedArticleColumn}:~:text=${textFragment}`
            : `${context.url}${expandAll}#:~:text=${textFragment}`
  }

  return buildLinkWithTextFragments(textStart, textEnd)
}
