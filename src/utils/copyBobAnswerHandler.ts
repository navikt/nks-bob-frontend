import analytics from "./analytics"
import { Message } from "../types/Message"
import { md } from "./markdown"

function buildClipboardContent(sourceNode: Node): { text: string; html: string } {
  const textContainer = document.createElement("div")
  const htmlContainer = document.createElement("div")
  textContainer.appendChild(sourceNode.cloneNode(true))
  htmlContainer.appendChild(sourceNode.cloneNode(true))

  textContainer.querySelectorAll("[data-citation], sup").forEach((el) => el.remove())
  htmlContainer.querySelectorAll("[data-citation], sup").forEach((el) => el.remove())

 textContainer.querySelectorAll("ul > li").forEach((li) => {
  li.textContent = `• ${li.textContent?.trim() ?? ""}`
})

textContainer.querySelectorAll("ol").forEach((ol) => {
  Array.from(ol.children)
    .filter((c): c is HTMLLIElement => c.tagName === "LI")
    .forEach((li, i) => {
      li.textContent = `${i + 1}. ${li.textContent?.trim() ?? ""}`
    })
})

  textContainer.querySelectorAll("p").forEach((p) => p.append("\n"))

  htmlContainer.querySelectorAll("ul, ol, p, h1, h2, h3, strong").forEach((el) => {
    el.insertAdjacentHTML("afterend", "<br>")
  })

const text = (textContainer.textContent ?? "")
  .replace(/[ \t]+/g, " ")
  .replace(/\s*\n\s*/g, "\n\n")     
  .replace(/[ \t]+(?=[.,;:!?)}»])/gu, "")
  .trim()

  const html = htmlContainer.innerHTML.replace(/[ \t]+(?=[.,;:!?)}»])/gu, "")

  return { text, html }
}

async function writeToClipboard(text: string, html: string): Promise<void> {
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" }),
    }),
  ])
}

/**
 * Kopierer den markerte delen av en rendret AppMarkdown til utklippstavlen.
 */
export async function copyMarkedBobAnswerHandler(message: Message): Promise<void> {
  const selection = document.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const fragment = range.cloneContents()

  const { text, html } = buildClipboardContent(fragment)
  await writeToClipboard(text, html)

  const messageLength = md.toPlaintext(message.content).length
  const copyLength = window.getSelection()?.toString().length ?? 0

  analytics.svartekstMarkert(copyLength / messageLength)
}

/**
 * Kopierer hele Bob-svaret til utklippstavlen med samme format som markert kopi.
 */
export async function copyFullBobAnswerHandler(message: Message): Promise<void> {
  const container = document.createElement("div")
  container.innerHTML = md.toHtml(message.content)

  const { text, html } = buildClipboardContent(container)
  await writeToClipboard(text, html)
}