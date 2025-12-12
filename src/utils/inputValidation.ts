import { countryCodePattern } from "./inputvalidation/tlfValidationAddons";

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

const fnrRegex = /\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])\d{2}[ .-]*?\d{3}[ .-]*\d{2}\b/
// fnrRegex fanger opp fødselsnummer på formatet DDMMÅÅIIIKK, med dag 01–31, måned 01–12 og valgfri separator.

const dnrRegex = /\b(4[1-9]|[56]\d|7[01])(0[1-9]|1[0-2])\d{2}[ .-]*?\d{3}[ .-]*\d{2}\b/
// dnrRegex fanger opp D-nummer der dagfeltet er fødselsdag + 40 (41–71), etterfulgt av måned 01–12 og resten av nummeret.

const hnrRegex = /\b(0[1-9]|[12]\d|3[01])(4[1-9]|5[0-2])\d{2}[ .-]*?\d{3}\d{2}\b/
// hnrRegex fanger opp H-nummer der månedfeltet er fødselsmåned + 40 (41–52), mens dag og resten av nummeret følger vanlig struktur.


const personnummerRegex = new RegExp(
  [fnrRegex, dnrRegex, hnrRegex].map(({ source }) => source).join("|"),
  "g"
)

export const validatePersonnummer = createValidator(
    personnummerRegex,
    error,
    "Tekst som ligner på et fødselsnummer:",
    "fnr",
  )

const nameRegex = /(?:(?:\p{Lu}[\p{L}.'-]*[ \t-]+(?:\p{Lu}[\p{L}.'-]*[ \t-]+)?\p{Lu}[\p{L}.'-]*)|(?:(?<!^)(?<![\p{P}\n]\s*)\b\p{Lu}\p{Ll}+\b))/gu
export const validateName = createValidator(nameRegex, warning, "Tekst som ligner på et navn:", "name")

/*
Fanger opp tekst som ligner på personnavn.

Matcher to typer:
1) Fullt navn med to eller tre navnedeler
2) Enkelt navn i tekst

For fullt navn:
- Består av fornavn og etternavn
- Mellomnavn er valgfritt
- Navnedeler kan separeres med mellomrom, tab eller bindestrek
- Hver navnedel ma starte med stor bokstav (\p{Lu})
- Navnedeler kan inneholde Unicode-bokstaver (\p{L}), punktum, apostrof eller bindestrek

For enkelt navn:
- Ord med stor forbokstav i teksten
- Matcher ikke første ord i teksten
- Matcher ikke ord etter tegnsetting eller linjeskift

*/


const dateOfBirthRegex = /\b(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?(?:[0]?[1-9]|[12]\d|3[01])[-./,]+?\d{2,4}\b/g
export const validateDateOfBirth = createValidator(dateOfBirthRegex, warning, "Tekst som ligner på fødselsdato:", "dob")

// dateOfBirthRegex fanger opp datoer skrevet som dd.mm.yy eller dd.mm.yyyy (f.eks. 01/02/1990), med ulike skilletegn som -, ., / eller , mellom tallene.


const globalPhoneNumberRegex = new RegExp(
  `(?:\\+|00)(?:${countryCodePattern})[ -]*(?:\\d[ -]*){5,14}\\d`,
  "g"
)

export const validateGlobalPhoneNumber= createValidator(globalPhoneNumberRegex, warning, "Tekst som ligner på et norsk mobilnummer:", "tlf")

// globalPhoneNumberRegex fanger opp alle telefonnumre som starter med + eller 00 etterfulgt av landekode og 6–15 sifre, med valgfri bruk av mellomrom eller bindestrek.



const norwegianMobileNumberRegex = /(?<!0047[ -]*)(?<!\+47[ -]*)\b[49](?:[ -]?\d){7}\b/g
export const validateNorwegianMobileNumber = createValidator(norwegianMobileNumberRegex, warning, "Tekst som ligner på et norsk mobilnummer:", "tlf")

// norwegianMobileNumberRegex fanger opp norske mobilnumre på 8 siffer som starter med 4 eller 9, med valgfri bruk av mellomrom eller bindestrek.


const emailRegex = /\S+@\S+/g
export const validateEmail = createValidator(emailRegex, warning, "Tekst som ligner på en epost-adresse:", "email")

// emailRegex fanger opp en e-post ved å søke etter tekst med formen "noe@noe" uten mellomrom.


const accountNumberRegex = /\b\d{4}[ .-]+\d{2}[ .-]+\d{5}\b/g

export const validateAccountNumber = createValidator(accountNumberRegex, warning, "Tekst som ligner på et kontonummer", "accountnumber")

// accountNumberRegex fanger opp norske kontonumre i formatet 4-2-5 siffer, med mellomrom, punktum eller bindestrek som skilletegn.