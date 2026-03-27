import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getOboTokenFromRequest } from "@/lib/auth/entra"

const MILJO = process.env.MILJO ?? "local"

const targetBaseUrl =
  {
    dev: "http://nks-bob-api",
    prod: "http://nks-bob-api",
    local: "http://localhost:8080",
    localnais: "http://localhost:8989",
  }[MILJO] ?? "http://localhost:8080"

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const targetPath = "/" + path.join("/")
  const url = new URL(targetPath, targetBaseUrl)
  url.search = req.nextUrl.search

  // Get OBO token
  const tokenResult = await getOboTokenFromRequest(req)
  if (!tokenResult.ok) {
    return NextResponse.json({ error: tokenResult.error }, { status: 401 })
  }

  // Build forwarded headers (strip cookies for security)
  const proxyHeaders = new Headers()
  proxyHeaders.set("Authorization", `Bearer ${tokenResult.data}`)
  proxyHeaders.set("Content-Type", req.headers.get("content-type") ?? "application/json")
  proxyHeaders.set("Accept", req.headers.get("accept") ?? "application/json")
  proxyHeaders.set("nav-call-id", req.headers.get("nav-call-id") ?? randomUUID())

  const isSSE = req.headers.get("content-type") === "text/event-stream"

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: proxyHeaders,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  }

  const response = await fetch(url.toString(), fetchOptions)

  // For SSE responses, stream the response back
  if (isSSE || response.headers.get("content-type")?.includes("text/event-stream")) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }

  // For regular responses, forward status + body
  const responseBody = await response.text()
  return new Response(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
