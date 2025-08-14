import { MsalProvider as MsalProviderBase } from "@azure/msal-react"
import { PublicClientApplication } from "@azure/msal-browser"
import { ReactNode, useEffect, useState } from "react"
import { msalConfig } from "./msalConfig"

interface MsalProviderProps {
  children: ReactNode
}

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

export const MsalProvider = ({ children }: MsalProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize()
        setIsInitialized(true)
      } catch (error) {
        console.error("MSAL initialization failed:", error)
        // Continue without MSAL if initialization fails
        setIsInitialized(true)
      }
    }

    initializeMsal()
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-pulse text-lg">Initialiserer autentisering...</div>
      </div>
    )
  }

  return (
    <MsalProviderBase instance={msalInstance}>
      {children}
    </MsalProviderBase>
  )
}