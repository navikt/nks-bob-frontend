export function createSSEParser(onEvent: (data: unknown) => void) {
  let buffer = ""
  let eventLines: string[] = []

  const processBuffer = () => {
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop()!

    for (const line of lines) {
      if (line === "") {
        if (eventLines.length > 0) {
          const dataLines = eventLines
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim())

          if (dataLines.length > 0) {
            try {
              onEvent(JSON.parse(dataLines.join("\n")))
            } catch {
              // ignore malformed JSON
            }
          }
          eventLines = []
        }
      } else {
        eventLines.push(line)
      }
    }
  }

  return {
    push(chunk: string) {
      buffer += chunk
      processBuffer()
    },
    flush() {
      processBuffer()
    },
  }
}
