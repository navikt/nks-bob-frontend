import { countryCodePattern, whitelistNames } from "./inputvalidation/tlfValidationAddons";

export type ValidationResult = ValidationOk | ValidationWarning | ValidationError

export type ValidationType = "fnr" | "dnr" | "hnr" | "firstname-three-times" | "fullname" | "tlf" | "email" | "accountnumber" | "dob-three-times" | "firstname-twice-and-dob"

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

export function replaceValidationResult(validationType: ValidationType) {
  if (validationType === "fullname") {
    return "(anonymisert navn)"
  }
  if (validationType === "firstname-three-times") {
    return "(anonymisert navn)"
  }
  if (validationType === "dob-three-times") {
    return "(anonymisert dato og år)"
  }
  if (validationType === "tlf") {
    return "(anonymisert telefonnummer)"
  }
  if (validationType === "email") {
    return "(anonymisert email)"
  }
  if (validationType === "accountnumber") {
    return "(anonymisert kontonummer)"
  }
  if (validationType === "fnr") {
    return "(anonymisert fødselsnummer)"
  }
  if (validationType === "dnr") {
    return "(anonymisert d-nummer)"
  }
  if (validationType === "hnr") {
    return "(anonymisert helsenummer)"
  }

  return "(anonymisert personopplysning)"
}

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

function createValidatorWithWhitelist(
  regex: RegExp,
  constructor: ValidationResultConstructor,
  message: string,
  type: ValidationType,
  whitelist: string[],
): Validator {
  return (input: string) => {
    if (!input.match(regex)) {
      return ok()
    }

   
    const matches = getMatches(regex, input).filter(
      (match) => {
        if (whitelist.includes(match.value)) {
          return false
        }
        
        const startsWithWhitelisted = whitelist.some(whitelistedWord => 
          match.value.startsWith(whitelistedWord + " ")
        )
        
        return !startsWithWhitelisted
      }
    )

    if (matches.length === 0) {
      return ok()
    }

    return constructor(message, type, matches)
  }
}

const fnrRegex = /\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])\d{2}[ .-]*?\d{3}[ .-]*\d{2}\b/g
// fnrRegex fanger opp fødselsnummer på formatet DDMMÅÅIIIKK, med dag 01–31, måned 01–12 og valgfri separator.

const dnrRegex = /\b(4[1-9]|[56]\d|7[01])(0[1-9]|1[0-2])\d{2}[ .-]*?\d{3}[ .-]*\d{2}\b/g
// dnrRegex fanger opp D-nummer der dagfeltet er fødselsdag + 40 (41–71), etterfulgt av måned 01–12 og resten av nummeret.

const hnrRegex = /\b(0[1-9]|[12]\d|3[01])(4[1-9]|5[0-2])\d{2}[ .-]*?\d{3}\d{2}\b/g
// hnrRegex fanger opp H-nummer der månedfeltet er fødselsmåned + 40 (41–52), mens dag og resten av nummeret følger vanlig struktur.


/* const personnummerRegex = new RegExp(
  [fnrRegex, dnrRegex, hnrRegex].map(({ source }) => source).join("|"),
  "g"
) */

export const validateFnr = createValidator(fnrRegex, error, "Tekst som ligner på et fødselsnummer:", "fnr")
export const validateDnr = createValidator(dnrRegex, error, "Tekst som ligner på et d-nummer:", "dnr")
export const validateHnr = createValidator(hnrRegex, error, "Tekst som ligner på et helsenummer", "dnr")

export const validatePersonnummer = (input: string): ValidationResult => {
  const fnrResult = validateFnr(input)
  if (isNotOk(fnrResult)) return fnrResult

  const dnrResult = validateDnr(input)
  if (isNotOk(dnrResult)) return dnrResult

  return validateHnr(input)
}

  //

  /* fullNameRegex matcher på tekst som ligner på fullt navn

   Matcher fullt navn med to eller tre navnedeler:
   - Består av fornavn og etternavn
   - Mellomnavn er valgfritt
   - Navnedeler kan separeres med mellomrom, tab eller bindestrek
   - Hver navnedel ma starte med stor bokstav (\p{Lu})
   - Navnedeler kan inneholde Unicode-bokstaver (\p{L}), punktum, apostrof eller bindestrek */

const fullNameRegex = /\b\p{Lu}[\p{L}'-]*(?:[ \t-]+\p{Lu}[\p{L}'-]*){1,2}\b/gu

export const validateFullName = createValidatorWithWhitelist(
  fullNameRegex,
  warning,
  "Tekst som ligner på et navn:",
  "fullname",
  whitelistNames
)

//

/* nameWordRegex: Matcher på 3x ord med stor forbokstav

   - Ord med stor forbokstav i teksten
   - Matcher ikke første ord i teksten
   - Matcher ikke ord etter tegnsetting eller linjeskift */

const nameWordRegex =
  /(?<!^)(?<![\p{P}\n]\s*)(?<!\p{Lu}[\p{L}'-]*[ \t-])\b\p{Lu}\p{Ll}+\b(?![ \t-]\p{Lu}[\p{L}'-]*)/gu

const has3NameWordsRegex =
  /^(?=(?:.*(?<!^)(?<![\p{P}\n]\s*)(?<!\p{Lu}[\p{L}'-]*[ \t-])\b\p{Lu}\p{Ll}+\b(?![ \t-]\p{Lu}[\p{L}'-]*)){3})/u


const baseValidateFirstName = createValidatorWithWhitelist(
  nameWordRegex,
  warning,
  "Tekst som ligner på et navn:",
  "firstname-three-times",
  whitelistNames
)

export const validateFirstName: Validator = (input: string) => {
  if (!has3NameWordsRegex.test(input)) {
    return ok()
  }
  return baseValidateFirstName(input)
}

//

/* Matcher på dato om det skrives inn minst 3 ganger
   Format: dd.mm.yy eller dd.mm.yyyy (f.eks. 01/02/1990), med ulike skilletegn som -, ., / eller , mellom tallene. */

const dobRegex =
  /\b(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?\d{2,4}\b/g

const has3DobRegex =
  /^(?=(?:[\s\S]*\b(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?\d{2,4}\b){3})/

const baseValidateDateOfBirth = createValidator(
  dobRegex,
  warning,
  "Tekst som ligner på fødselsdato:",
  "dob-three-times",
)

export const validateDateOfBirth: Validator = (input: string) => {
  if (!has3DobRegex.test(input)) {
    return ok()
  }

  return baseValidateDateOfBirth(input)
}

//

// Regel for å matche om 2 ord med stor forbokstav + dato

const has2NamesAnd1DobRegex = new RegExp(
  `^(?=(?:[\\s\\S]*${nameWordRegex.source}){2})(?=[\\s\\S]*${dobRegex.source})`,
  "u",
)

const nameOrDobRegex = new RegExp(
  `(?:${nameWordRegex.source})|(?:${dobRegex.source})`,
  "gu",
)

const baseValidateNameAndDob = createValidator(
  nameOrDobRegex,
  warning,
  "Tekst som ligner på navn + fødselsdato:",
  "firstname-twice-and-dob", 
)

export const validateNameAndDob: Validator = (input: string) => {
  if (!has2NamesAnd1DobRegex.test(input)) return ok()
  return baseValidateNameAndDob(input)
}

//

// globalPhoneNumberRegex fanger opp alle telefonnumre som starter med + eller 00 etterfulgt av landekode og 6–15 sifre, med valgfri bruk av mellomrom eller bindestrek.
const globalPhoneNumberRegex = new RegExp(
  `(?:\\+|00)(?:${countryCodePattern})[ -]*(?:\\d[ -]*){5,14}\\d`,
  "g"
)

export const validateGlobalPhoneNumber= createValidator(globalPhoneNumberRegex, warning, "Tekst som ligner på et norsk mobilnummer:", "tlf")

//

// norwegianMobileNumberRegex fanger opp norske mobilnumre på 8 siffer som starter med 4 eller 9, med valgfri bruk av mellomrom eller bindestrek.
const norwegianMobileNumberRegex = /(?<!0047[ -]*)(?<!\+47[ -]*)\b[49](?:[ -]?\d){7}\b/g
export const validateNorwegianMobileNumber = createValidator(norwegianMobileNumberRegex, warning, "Tekst som ligner på et norsk mobilnummer:", "tlf")

//

// emailRegex fanger opp en e-post ved å søke etter tekst med formen "noe@noe" uten mellomrom.
const emailRegex = /\S+@\S+/g
export const validateEmail = createValidator(emailRegex, warning, "Tekst som ligner på en epost-adresse:", "email")

//

// accountNumberRegex fanger opp norske kontonumre i formatet 4-2-5 siffer, med mellomrom, punktum eller bindestrek som skilletegn.
const accountNumberRegex = /\b\d{4}[ .-]+\d{2}[ .-]+\d{5}\b/g

export const validateAccountNumber = createValidator(accountNumberRegex, warning, "Tekst som ligner på et kontonummer", "accountnumber")