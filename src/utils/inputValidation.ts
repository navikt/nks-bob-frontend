export type ValidationResult = ValidationOk | ValidationWarning | ValidationError

export type ValidationType = "fnr" | "name" | "tlf"

export type ValidationMatch = { value: string; start: number; end: number }

export type ValidationOk = { status: "ok" }

export type ValidationWarning = {
  status: "warning"
  message: string
  matches: ValidationMatch[]
  validationType: ValidationType
}

export type ValidationError = {
  status: "error"
  message: string
  matches: ValidationMatch[]
  validationType: ValidationType
}

const ok = (): ValidationOk => ({ status: "ok" })

const warning = (message: string, validationType: ValidationType, matches: ValidationMatch[]): ValidationWarning => ({
  status: "warning",
  message,
  matches,
  validationType,
})

const error = (message: string, validationType: ValidationType, matches: ValidationMatch[]): ValidationError => ({
  status: "error",
  message,
  matches,
  validationType,
})

export function isOk(result: ValidationResult): result is ValidationOk {
  return result.status === "ok"
}

export function isNotOk(result: ValidationResult): result is ValidationError | ValidationWarning {
  return result.status !== "ok"
}

export function isWarning(result: ValidationResult): result is ValidationWarning {
  return result.status === "warning"
}

export function isError(result: ValidationResult): result is ValidationError {
  return result.status === "error"
}

export type Validator = (input: string) => ValidationResult

function getMatches(regex: RegExp, input: string): ValidationMatch[] {
  return Array.from(input.matchAll(regex)).map((match) => ({
    value: match[0],
    start: match.index,
    end: match.index + match[0].length,
  }))
}

const fnrRegex = /([0-2][0-9]|31(?!(?:0[2469]|11))|30(?!02))(0[1-9]|1[0-2])(\d{2})( ?)(\d{5})/
const dnrRegex = /([4-6][0-9]|71(?!(?:0[2469]|11))|70(?!02))(0[1-9]|1[0-2])(\d{2})( ?)(\d{5})/
const hnrRegex = /([0-2][0-9]|31(?!(?:4[2469]|51))|30(?!02))(4[1-9]|5[0-2])(\d{2})( ?)(\d{5})/
const personnummerRegex = new RegExp([fnrRegex, dnrRegex, hnrRegex].map(({ source }) => source).join("|"), "g")
export function validatePersonnummer(input: string): ValidationResult {
  if (!input.match(personnummerRegex)) {
    return ok()
  }

  const matches = getMatches(personnummerRegex, input)
  return error("Tekst som ligner på et fødselsnummer:", "fnr", matches)
}

const nameRegex = /[A-ZÆØÅ]\w*[^\S\r\n]+?[A-ZÆØÅ]\w*/g
export function validateName(input: string): ValidationResult {
  if (!input.match(nameRegex)) {
    return ok()
  }

  const matches = getMatches(nameRegex, input)
  return warning("Tekst som ligner på et navn:", "name", matches)
}

const tlfRegex = /((0047)?|(\+47)?)[4|9]\d{7}/g
export function validateTlf(input: string): ValidationResult {
  if (!input.match(tlfRegex)) {
    return ok()
  }

  const matches = getMatches(tlfRegex, input)
  return warning("Tekst som ligner på et telefonnummer:", "tlf", matches)
}

// TODO validator for "Sluttbruker NAVN"? eller evt "Sluttbruker NAVN • 15. oktober 2025, kl. 20.17"
// TODO Dato
