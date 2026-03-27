import { NextRequest } from "next/server"
import { getOboTokenFromRequest } from "@/lib/auth/entra"
import { createSSEParser } from "@/lib/server/sseParser"

const MILJO = process.env.MILJO ?? "local"

const targetBaseUrl =
  (
    {
      dev: "http://nks-bob-api",
      prod: "http://nks-bob-api",
      local: "http://localhost:8080",
      localnais: "http://localhost:8989",
    } as Record<string, string>
  )[MILJO] ?? "http://localhost:8080"

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params
  const { content } = await req.json()

  const tokenResult = await getOboTokenFromRequest(req)
  if (!tokenResult.ok) {
    return new Response(JSON.stringify({ error: tokenResult.error }), { status: 401 })
  }

  const backendResponse = await fetch(
    `${targetBaseUrl}/api/v2/conversations/${conversationId}/messages/sse`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.data}`,
        "Content-Type": "text/event-stream",
      },
      body: JSON.stringify({ content }),
    },
  )

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response(null, { status: backendResponse.status })
  }

  // Read backend SSE, parse it server-side, stream NDJSON back to client
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = backendResponse.body!.pipeThrough(new TextDecoderStream()).getReader()
      const parser = createSSEParser((event) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"))
      })

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          if (value) parser.push(value)
        }
        parser.flush()
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  })
}
