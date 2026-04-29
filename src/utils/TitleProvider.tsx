import { Head } from "@unhead/react"

function resolveEnvironment() {
  if (window.location.href.includes("localhost")) {
    return "local"
  }

  if (window.location.href.includes("bob.ansatt.dev.nav.no")) {
    return "dev"
  }

  return "prod"
}

function resolveIcon(environment: string) {
  if (environment === "prod") {
    return "./src/assets/icons/BobHead.svg"
  }

  return "./src/assets/icons/BobDevHead.svg"
}

const resolveTitle = (environment: string) => {
  if (environment === "local") {
    return "Bob - Lokalt"
  }

  if (environment === "dev") {
    return "Bob - Utvikling"
  }

  return "Bob"
}

export const TitleProvider = () => {
  const environment = resolveEnvironment()
  const title = resolveTitle(environment)
  const icon = resolveIcon(environment)

  return (
    <Head>
      <title>{title}</title>
      <link
        rel='icon'
        type='image/svg+xml'
        href={icon}
      />
    </Head>
  )
}
