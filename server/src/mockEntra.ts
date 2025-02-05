import { NextFunction, Request, Response } from "express"
import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"
import { Logger } from "winston"
import { result, TokenResult } from "./utils.js"

const tokenCache = new CacheContainer(new MemoryStorage())

async function fetchToken() {
  const url = "https://fakedings.intern.dev.nav.no/fake/custom"
  const options = {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      NAVident: process.env.VITE_NAVIDENT ?? "Z123456",
      aud: "nks-bob-api",
      azp: "consumer-client-id",
      sub: "31a9a29e-a7e9-4a4b-b823-8c39707e475e",
      scp: "User.Read",
      ver: "2.0",
      azpacr: "1",
      aio: "31dfd903-1d65-4512-9e8d-59acd70859ce",
      tid: "default",
    }),
  }

  const res = await fetch(url, options)
  const token = await res.text()
  return token
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
