import * as oasis from '@navikt/oasis';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { MILJO } from './server.js';
import * as mock from './mockEntra.js';
import * as texas from './texas.js'
import { IncomingMessage } from 'http';
import { TokenResult } from './utils.js';

const entraHandler = (audience: string, log: Logger) =>
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!audience) {
        next();
        return;
      }

      const subjectToken = oasis.getToken(req);
      if (!subjectToken || subjectToken === '') {
        log.info('no subjectToken found.');
        res.status(401).send({ error: "Subject token not provided" })
        // next();
        return;
      }

      // const validation = await oasis.validateToken(subjectToken);
      // if (!validation.ok) {
      //   log.info('unauthorized request. subjectToken is invalid.');
      //   res.status(401).send();
      //   return;
      // }

      // const obo = await oasis.requestOboToken(subjectToken, audience);
      // if (!obo.ok) {
      //   log.warn(`token exchange failed. could not obtain obo token. ${obo.error}`);
      //   res.status(401).send();
      //   return;
      // }

      const result = await texas.getOboToken(log, req, audience)
      if (!result.ok) {
        res.status(401).send({ error: result.error })
        return;
      }

      const { data: token } = result
      req.headers.authorization = `Bearer ${token}`;
      res.setHeader("Authorization", `Bearer ${token}`)

      next();
    } catch (err) {
      next(err);
    }
  };

// const getOboToken = async (
//   log: Logger,
//   req: Request | IncomingMessage,
//   audience: string,
// ): Promise<string | null> => {
//   const subjectToken = oasis.getToken(req)!;
//   // if (!subjectToken || subjectToken === '') {
//   //   log.info('no subjectToken found, skipping entra.');
//   //   return null;
//   // }

//   const validation = await oasis.validateToken(subjectToken);
//   if (!validation.ok) {
//     log.info('unauthorized request. subjectToken is invalid.');
//     return null;
//   }

//   const obo = await oasis.requestOboToken(subjectToken, audience);
//   if (!obo.ok) {
//     log.warn(`token exchange failed. could not obtain obo token. ${obo.error}`);
//     return null;
//   }

//   return obo.token
// }

export const entraMiddleware =
  ({ audience, log }: { audience: string, log: Logger }) =>
    MILJO === "local"
      ? mock.entraHandler(audience, log)
      : entraHandler(audience, log)


export const getToken =
  (log: Logger, req: IncomingMessage, audience: string): Promise<TokenResult> =>
    MILJO === "local"
      ? mock.getToken()
      : texas.getOboToken(log, req, audience)
