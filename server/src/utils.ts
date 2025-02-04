export type Result<Err, Data>
  = { ok: false, error: Err }
  | { ok: true, data: Data }

export const result = {
  error: <Err, Data>(error: Err): Result<Err, Data> => ({ ok: false, error }),
  ok: <Err, Data>(data: Data): Result<Err, Data> => ({ ok: true, data }),
}

export type TokenResult = Result<string, string>
