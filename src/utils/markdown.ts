import { Renderer, Parser } from "marked"

const block = ({ text }: { text: string }) => text + "\n\n";
const line = ({ text }: { text: string }) => text + "\n";
const inline = ({ text }: { text: string }) => text;
const newline = () => "\n";
const empty = () => "";

export const plaintextRenderer: Renderer = {
  parser: new Parser(),
  // Block elements
  list: ({ raw }) => {
    return raw

    // return block({
    //   text: items.map((item, index) => {
    //     const bullet = ordered
    //       ? `${index + 1}`
    //       : "-";

    //     return `  ${bullet} ${item.text}`;
    //   }).join("\n")
    // });
  },
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
  space: empty,
  // etc.
  options: {},
}

