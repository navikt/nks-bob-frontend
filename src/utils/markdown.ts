import { Root, Text } from "mdast"
import { findAndReplace } from "mdast-util-find-and-replace"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkRehype from "remark-rehype"
import remarkStringify, { Options } from "remark-stringify"
import stripMarkdown from "strip-markdown"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

// Remove all citations ([0]) from the text
const removeCitations: Plugin<[], Root> = () => {
  return (tree) => {
    findAndReplace(tree, [/\s?\[\d\]/g])
  }
}

// Convert all citations to a span with citation number and position as properties
const remarkCitations: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent) return

      const citationRegex = /\[(\d)\]/g
      const value = node.value

      let match
      let lastIndex = 0
      const newNodes: any[] = []

      while ((match = citationRegex.exec(value)) !== null) {
        const [fullMatch, id] = match
        const start = match.index

        if (start > lastIndex) {
          newNodes.push({
            type: "text",
            value: value.slice(lastIndex, start),
          })
        }

        newNodes.push({
          type: "html",
          value: `<span data-citation="${id}" data-position="${start}"></span>`,
        })

        lastIndex = start + fullMatch.length
      }

      if (lastIndex < value.length) {
        newNodes.push({
          type: "text",
          value: value.slice(lastIndex),
        })
      }

      parent.children.splice(index!, 1, ...newNodes)
    })
  }
}

const htmlProcessor = remark()
  .use(removeCitations)
  .use(remarkRehype)
  .use(rehypeStringify)

const toHtml = (markdown: string): string =>
  htmlProcessor.processSync(markdown).toString()

// Convert markdown to plaintext, but keep formatting for lists
// and transform links to just the url.
const plaintextProcessor = remark()
  .use(stripMarkdown, { keep: ["list", "listItem", "link"] })
  .use(remarkStringify, {
    bullet: "-",
    handlers: {
      link: ({ url }: { url: string }) => url,
    },
  } as Options)
  .use(removeCitations)

const toPlaintext = (markdown: string) =>
  plaintextProcessor.processSync(markdown).toString()

const md = { toHtml, toPlaintext, remarkCitations }

export { md }
