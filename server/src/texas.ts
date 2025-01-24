import * as oasis from "@navikt/oasis"
import { IncomingMessage } from "http"
import { Logger } from "winston"
import { NAIS_TOKEN_EXCHANGE_ENDPOINT } from "./server.js"
import { result, TokenResult } from "./utils.js"

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
  log: Logger,
  req: Request | IncomingMessage,
  audience: string,
): Promise<TokenResult> => {
  const subjectToken = oasis.getToken(req)
  if (!subjectToken) {
    const message = "Invalid or missing subject token"
    log.warn(message)
    return result.error(message)
  }

  const expiresIn = oasis.expiresIn(subjectToken)

  const response = await fetch(
    NAIS_TOKEN_EXCHANGE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identity_provider: 'azuread',
      target: audience,
      user_token: subjectToken,
      skip_cache: expiresIn < 300, // force a new token if it expires in less than 5 minutes
    })
  })

  if (!response.ok) {
    const { error, error_description }: TexasTokenError = await response.json()
    log.warn(`invalid token response from texas: ${response.statusText} ${error}`)

    return result.error(error_description)
  }

  const { access_token }: TexasTokenSuccess = await response.json()
  return result.ok(access_token)
}
