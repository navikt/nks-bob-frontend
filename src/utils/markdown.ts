import { marked, Renderer, Parser, Hooks } from "marked"

const block = ({ text }: { text: string }) => text
const line = ({ text }: { text: string }) => text
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
  link: ({ href }) => href, // Somehow not working in the version of marked...
  image: empty,
  text: inline,
  space: () => "\n\n",
  // etc.
  options: {},
}

const toHtml = (markdown: string): string =>
  marked.parse(markdown, { async: false })

const hooks = new Hooks()
hooks.postprocess = (html) => {
  // Since the link renderer is not working in this version,
  // this regex replaces all markdown links with the href.
  return html.replace(/\[.*?\]\((.*?)\)/g, (_match, p1) => p1)
}

const toPlaintext = (markdown: string): string =>
  marked.parse(markdown, {
    async: false,
    renderer: plaintextRenderer,
    hooks
  })

const md = { toHtml, toPlaintext, }

export { md }
