import { Renderer, Parser } from "marked"

const block = ({ text }: { text: string }) => text + "\n\n";
const line = ({ text }: { text: string }) => text + "\n";
const inline = ({ text }: { text: string }) => text;
const newline = () => "\n";
const empty = () => "";

export const plaintextRenderer: Renderer = {
  parser: new Parser(),
  // Block elements
  list: ({ ordered, items }) =>
    items.map((item, index) => {
      if (ordered) {
        return `  ${index + 1} ${item.text}\n`
      }

      return `  - ${item.text}\n`
    }).join(""),
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
  link: ({ href }) => href,
  image: empty,
  text: inline,
  space: () => " ",
  // etc.
  options: {},
}

