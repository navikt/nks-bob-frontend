/**
 * Kopierer den markerte delen av en rendret AppMarkdown til utklippstavlen,
 * med kulepunkter i plain text og bevart struktur i HTML-versjonen.
 * Fjerner sitatnumre fra begge versjoner.
 */
export async function copySelectionAsMarkdown(): Promise<void> {
  const selection = document.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const textContainer = document.createElement("div")
  const htmlContainer = document.createElement("div")
  textContainer.appendChild(range.cloneContents())
  htmlContainer.appendChild(range.cloneContents())

  // Fjern sitater fra plain text og html
  textContainer.querySelectorAll("[data-citation], sup").forEach((el) => el.remove())
  htmlContainer.querySelectorAll("[data-citation], sup").forEach((el) => el.remove())

  // Plain text: kulepunkt foran <li> og linjeskift mellom avsnitt
 textContainer.querySelectorAll("li").forEach((li) => {
    li.textContent = `• ${li.textContent?.trim()}`
  })
  textContainer.querySelectorAll("p").forEach((p) => p.append("\n"))

  // HTML: linjeskifte 
htmlContainer.querySelectorAll("ul, ol, p, h1, h2, h3, strong").forEach((el) => {
  el.insertAdjacentHTML("afterend", "<br>")
})

const text = (textContainer.textContent ?? "")
  .replace(/[ \t]+/g, " ")
  .replace(/[ \t]+(?=\p{P})/gu, "")

const html = htmlContainer.innerHTML.replace(/\s+(?=\p{P})/gu, "")
  console.log("HTML:", JSON.stringify(text))

  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" }),
    }),
  ])
}