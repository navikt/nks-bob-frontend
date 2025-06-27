import { Alert } from "@navikt/ds-react"
import { PropsWithChildren } from "react"
import { useUserConfig } from "../api/api"
import Header from "./header/Header"
import { isSalesforceMode } from "../utils/iframe"
import { IframeLoginButton } from "./auth/IframeLoginButton"

export const LoginBoundary = (props: PropsWithChildren) => {
  const { userConfig, error, isLoading } = useUserConfig()

  if (error?.status === 401 || error?.status === 302) {
    const currentHref = window.location.href
    const loginUrl = `/login?referer=${encodeURIComponent(currentHref)}`

    if (isSalesforceMode()) {
      // Show login UI for iframe context
      return (
        <>
          <Header conversation={undefined} />
          <div
            style={{ width: "60rem", margin: "32px auto", padding: "0 16px" }}
          >
            <Alert variant='warning' className='mb-4'>
              Du må logge inn for å bruke Bob.
            </Alert>
            <IframeLoginButton loginUrl={loginUrl} />
          </div>
        </>
      )
    }

    // Direct redirect for standalone app
    window.location.href = loginUrl
    return <></>
  } else if (userConfig !== undefined) {
    return <>{props.children}</>
  } else if (error) {
    console.error({ error })
    if (isSalesforceMode()) {
    const currentHref = window.location.href
    const loginUrl = `/login?referer=${encodeURIComponent(currentHref)}`
      // Show login UI for iframe context
      return (
        <>
          <Header conversation={undefined} />
          <div
            style={{ width: "60rem", margin: "32px auto", padding: "0 16px" }}
          >
            <Alert variant='warning' className='mb-4'>
              Du må logge inn for å bruke Bob.
            </Alert>
            <IframeLoginButton loginUrl={loginUrl} />
          </div>
        </>
      )
    }

    return (
      <>
        <Header conversation={undefined} />
        <div style={{ width: "60rem", margin: "32px auto" }}>
          <Alert variant='error'>
            Uventet feil. Prøv å last siden på nytt.
          </Alert>
        </div>
      </>
    )
  } else if (isLoading) {
    return <>{props.children}</>
  }

  return "unknown"
}
