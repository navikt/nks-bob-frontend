export type UserConfig = {
  showStartInfo: boolean
  showTutorial: boolean
  showNewConceptInfo: boolean
  userType: "user" | "admin"
}

export type UserInfo = {
  fullnameInverted: string | null // Nordmann, Ola
  fullname: string | null // Ola Nordmann
  firstName: string | null // Ola
  lastName: string | null // Nordmann
  email: string | null // ola.nordmann@nav.no
}
