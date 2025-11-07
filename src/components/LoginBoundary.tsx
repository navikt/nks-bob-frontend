import { PropsWithChildren } from "react"
import { useUserConfig } from "../api/api"

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
    throw error
  } else if (isLoading) {
    return <>{props.children}</>
  }

  return "unknown"
}
