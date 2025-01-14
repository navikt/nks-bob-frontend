import { marked, Renderer, Parser } from "marked"

const block = ({ text }: { text: string }) => text + ""
const line = ({ text }: { text: string }) => text + ""
const inline = ({ text }: { text: string }) => text
const newline = () => "\n"
const empty = () => ""

const plaintextRenderer: Renderer = {
  parser: new Parser(),
  // Block elements
  list: ({ raw }) => block({ text: raw }),
  code: block,
  blockquote: block,
  html: empty,
  heading: block,
  hr: newline,
  listitem: line,
  checkbox: empty,
  paragraph: block,
  table: ({ header }) => line({ text: header.join(" ") }),
  tablerow: ({ text }) => line({ text: text.trim() }),
  tablecell: ({ text }) => text + " ",
  // Inline elements
  strong: inline,
  em: inline,
  codespan: inline,
  br: newline,
  del: inline,
  link(token) {
    console.log(token)
    return token.href
  },
  image: empty,
  text: inline,
  space: () => "\n\n",
  // etc.
  options: {},
}

const toHtml = (markdown: string) =>
  marked.parse(markdown, { async: false })

const toPlaintext = (markdown: string) =>
  marked.parse(markdown, { async: false, renderer: plaintextRenderer })

const md = { toHtml, toPlaintext, }

export { md }
