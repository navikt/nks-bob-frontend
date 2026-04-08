import * as oasis from "@navikt/oasis"
import { IncomingMessage } from "http"
import { result, TokenResult } from "./utils"

const NAIS_TOKEN_EXCHANGE_ENDPOINT = process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT ?? ""

type TexasTokenError = {
  error: string
  error_description: string
}

type TexasTokenSuccess = {
  access_token: string
  expires_in: number
  token_type: string
}

export const getOboToken = async (
  req: Request | IncomingMessage,
  audience: string,
): Promise<TokenResult> => {
  const subjectToken = oasis.getToken(req)
  if (!subjectToken) {
    return result.error("Invalid or missing subject token")
  }

  const expiresIn = oasis.expiresIn(subjectToken)

  const response = await fetch(NAIS_TOKEN_EXCHANGE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identity_provider: "azuread",
      target: audience,
      user_token: subjectToken,
      skip_cache: expiresIn < 300,
    }),
  })

  if (!response.ok) {
    const { error_description }: TexasTokenError = await response.json()
    return result.error(error_description)
  }

  const { access_token }: TexasTokenSuccess = await response.json()
  return result.ok(access_token)
}
