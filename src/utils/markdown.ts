import { Root } from "mdast"
import { findAndReplace } from "mdast-util-find-and-replace"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkRehype from "remark-rehype"
import remarkStringify, { Options } from "remark-stringify"
import stripMarkdown from "strip-markdown"
import { Plugin } from "unified"

const removeCitations: Plugin<[], Root> = () => {
  return (tree) => {
    findAndReplace(tree, [/\s?\[\d\]/g])
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

const md = { toHtml, toPlaintext }

export { md }
