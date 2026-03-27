import * as oasis from "@navikt/oasis"
import { result, TokenResult } from "./utils"

let cachedToken: string | null = null
let cacheExpiry = 0

async function fetchToken(): Promise<string> {
  const url = "http://localhost:8899/entraid/token"
  const options = {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      NAVident: process.env.VITE_NAVIDENT ?? "Z123456",
      grant_type: "authorization_code",
      code: "code",
      client_id: "id",
      client_secret: "secret",
    }),
  }

  const res = await fetch(url, options)
  const { access_token } = (await res.json()) as { access_token: string }
  return access_token
}

export async function getToken(): Promise<TokenResult> {
  if (cachedToken && oasis.expiresIn(cachedToken) > 60 && Date.now() < cacheExpiry) {
    return result.ok(cachedToken)
  }

  const newToken = await fetchToken()
  cachedToken = newToken
  cacheExpiry = Date.now() + 55 * 60 * 1000 // 55 minutes
  return result.ok(newToken)
}
