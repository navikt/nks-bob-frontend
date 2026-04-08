import { headers } from "next/headers"
import * as mock from "./mock-entra"
import * as texas from "./texas"
import { TokenResult } from "./utils"

const MILJO = process.env.MILJO ?? "local"

const audience =
  {
    dev: "api://dev-gcp.nks-aiautomatisering.nks-bob-api/.default",
    prod: "api://prod-gcp.nks-aiautomatisering.nks-bob-api/.default",
    localnais: "api://dev-gcp.nks-aiautomatisering.nks-bob-api/.default",
  }[MILJO] ?? "localaudience"

export { audience }

/**
 * Get an OBO token for proxying to nks-bob-api.
 * In local mode, uses mock Entra. Otherwise, uses Texas token exchange.
 */
export async function getOboTokenFromRequest(req: Request): Promise<TokenResult> {
  if (MILJO === "local") {
    return mock.getToken()
  }
  return texas.getOboToken(req, audience)
}

/**
 * Extract user token from the incoming request headers.
 * Wonderwall passes the token as a Bearer token in the Authorization header.
 */
export function getTokenFromHeaders(headersList: Awaited<ReturnType<typeof headers>>): string | null {
  const authorization = headersList.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return null
  return authorization.slice(7)
}
