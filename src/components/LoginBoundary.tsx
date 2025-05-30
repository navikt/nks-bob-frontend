import { Alert } from "@navikt/ds-react"
import { PropsWithChildren } from "react"
import { useUserConfig } from "../api/api"
import Header from "./header/Header"

export const LoginBoundary = (props: PropsWithChildren) => {
  const { userConfig, error, isLoading } = useUserConfig()

  if (error?.status === 401) {
    const currentHref = window.location.href
    window.location.href = `/login?referer=${encodeURIComponent(currentHref)}`
    return <></>
  } else if (userConfig !== undefined) {
    return <>{props.children}</>
  } else if (error) {
    console.error({ error })
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
