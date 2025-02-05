import * as oasis from "@navikt/oasis"
import { NextFunction, Request, Response } from "express"
import { IncomingMessage } from "http"
import { Logger } from "winston"
import * as mock from "./mockEntra.js"
import { MILJO } from "./server.js"
import * as texas from "./texas.js"
import { TokenResult } from "./utils.js"

const entraHandler =
  (audience: string, log: Logger) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!audience) {
        next()
        return
      }

      const subjectToken = oasis.getToken(req)
      if (!subjectToken || subjectToken === "") {
        log.info("no subjectToken found.")
        res.status(401).send({ error: "Subject token not provided" })
        return
      }

      const result = await texas.getOboToken(log, req, audience)
      if (!result.ok) {
        res.status(401).send({ error: result.error })
        return
      }

      const { data: token } = result
      req.headers.authorization = `Bearer ${token}`
      res.setHeader("Authorization", `Bearer ${token}`)

      next()
    } catch (err) {
      next(err)
    }
  }

export const entraMiddleware = ({
  audience,
  log,
}: {
  audience: string
  log: Logger
}) =>
  MILJO === "local"
    ? mock.entraHandler(audience, log)
    : entraHandler(audience, log)

export const getToken = (
  log: Logger,
  req: IncomingMessage,
  audience: string,
): Promise<TokenResult> =>
  MILJO === "local" ? mock.getToken() : texas.getOboToken(log, req, audience)
