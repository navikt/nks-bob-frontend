import { countryCodePattern, whitelistNumbers } from "./inputvalidation/tlfValidationAddons";

export type ValidationResult = ValidationOk | ValidationWarning | ValidationError

export type ValidationType = "fnr" | "name" | "tlf" | "email" | "accountnumber" | "dob"

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

type ValidationResultConstructor = (
  message: string,
  validationType: ValidationType,
  matches: ValidationMatch[],
) => ValidationWarning | ValidationError

const ok = (): ValidationOk => ({ status: "ok" })

const warning: ValidationResultConstructor = (
  message: string,
  validationType: ValidationType,
  matches: ValidationMatch[],
): ValidationWarning => ({
  status: "warning",
  message,
  matches,
  validationType,
})

const error: ValidationResultConstructor = (
  message: string,
  validationType: ValidationType,
  matches: ValidationMatch[],
): ValidationError => ({
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

function createValidator(
  regex: RegExp,
  constructor: ValidationResultConstructor,
  message: string,
  type: ValidationType,
): Validator {
  return (input: string) => {
    if (!input.match(regex)) {
      return ok()
    }

    const matches = getMatches(regex, input)
    return constructor(message, type, matches)
  }
}

const fnrRegex = /([0-2][0-9]|31(?!(?:0[2469]|11))|30(?!02))(0[1-9]|1[0-2])(\d{2})(.?)(\d{3})(.?)(\d{2})/
const dnrRegex = /([4-6][0-9]|71(?!(?:0[2469]|11))|70(?!02))(0[1-9]|1[0-2])(\d{2})(.?)(\d{3})(.?)(\d{2})/
const hnrRegex = /([0-2][0-9]|31(?!(?:4[2469]|51))|30(?!02))(4[1-9]|5[0-2])(\d{2})(.?)(\d{3})(.?)(\d{2})/
const personnummerRegex = new RegExp([fnrRegex, dnrRegex, hnrRegex].map(({ source }) => source).join("|"), "g")

export const validatePersonnummer = (input: string): ValidationResult => {

  return createValidator(
    personnummerRegex,
    error,
    "Tekst som ligner på et fødselsnummer:",
    "fnr",
  )(input)
}

const nameRegex = /\p{Lu}[\p{L}.'-]*[ \t-]+(?:\p{Lu}[\p{L}.'-]*[ \t-]+)?\p{Lu}[\p{L}.'-]*/gu
export const validateName = createValidator(nameRegex, warning, "Tekst som ligner på et navn:", "name")

/*
nameRegex fanger opp følgende kombinasjoner av navn:

1) Fornavn + Etternavn
2) Fornavn + Mellomnavn + Etternavn  (mellomnavn er valgfritt)
3) Separasjon mellom navnedeler kan være 1 eller flere:
   - mellomrom (space/tab)
   - bindestrek (-)
4) Hver navnedel må starte med stor bokstav (\p{Lu}),
   og kan inneholde bokstaver, punktum, apostrof eller bindestrek.

*/

const dateOfBirthRegex = /\b(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?\d{2,4}\b/g
export const validateDateOfBirth = createValidator(dateOfBirthRegex, warning, "Tekst som ligner på fødselsdato:", "dob")


const tlfRegex = new RegExp(
  `((\\+|00)(${countryCodePattern})\\s*(?:\\d[ -]?){5,10}\\d)|\\b(?:\\d[ -]?){7,10}\\d\\b`,
  'g'
)
export const validateTlf = (input: string): ValidationResult => {
  if (input.match(dateOfBirthRegex)) {
    return ok()
  }

  if (input.match(personnummerRegex)) {
    return ok()
  }

  const stripped = input.replace(/[ -]/g, '')
  const intlMatch = stripped.match(new RegExp(`^(?:\\+|00)(${countryCodePattern})\\s*(\\d+)$`))

  const cleanedInput =
    intlMatch?.[2] 
      ?? input.replace(/\D/g, '')

  if (whitelistNumbers.includes(cleanedInput)) {
    return ok()
  }

  return createValidator(tlfRegex, warning, "Tekst som ligner på et telefonnummer:", "tlf")(input)
}

const emailRegex = /\S+@\S+/g
export const validateEmail = createValidator(emailRegex, warning, "Tekst som ligner på en epost-adresse:", "email")

const accountNumberRegex = /\b\d{4}[\s.-]?\d{2}[\s.-]?\d{5}\b|\b\d{11}\b/g

export const validateAccountNumber = (input: string): ValidationResult => {
  if (input.match(personnummerRegex)) {
    return ok()
  }

  return createValidator(accountNumberRegex, warning, "Tekst som ligner på et kontonummer", "accountnumber")(input)

}








