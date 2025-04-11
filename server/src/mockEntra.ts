import { NextFunction, Request, Response } from "express"
import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"
import { Logger } from "winston"
import { result, TokenResult } from "./utils.js"

const tokenCache = new CacheContainer(new MemoryStorage())

type MockTokenResponse = {
  token_type: string
  id_token: string
  access_token: string
  refresh_token: string
  expires_in: number
}

async function fetchToken() {
  const url = "http://localhost:8888/entraid/token"
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
  const { access_token } = (await res.json()) as MockTokenResponse
  return access_token
}

export async function getToken(log: Logger): Promise<TokenResult> {
  const cachedToken = await tokenCache.getItem<string>("token")
  if (cachedToken) {
    return result.ok(cachedToken)
  }

  log.info("Token expired. Fetching new token.")
  const newToken = await fetchToken()
  await tokenCache.setItem("token", newToken, { ttl: 55 * 60 }) // 55 minutes

  return result.ok(newToken)
}

export const entraHandler =
  (_audience: string, log: Logger) =>
  async (_req: Request, res: Response, next: NextFunction) => {
    const result = await getToken(log)
    if (result.ok) {
      res.setHeader("Authorization", `Bearer ${result.data}`)
    }

    next()
  }
