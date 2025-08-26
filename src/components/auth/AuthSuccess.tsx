import { useEffect } from "react"
import { Alert } from "@navikt/ds-react"
import { useMsal } from "@azure/msal-react"

export default () => {
  const { instance } = useMsal()

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Handle MSAL redirect promise
        const response = await instance.handleRedirectPromise()
        
        if (response) {
          console.log("MSAL authentication successful:", response)
        }

        // Notify parent window (iframe) that auth was successful
        if (window.opener) {
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            timestamp: Date.now(),
            source: 'msal-auth'
          }, '*')
          
          // Close the popup
          setTimeout(() => {
            window.close()
          }, 1000)
        } else {
          // If not a popup, redirect to home
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
        }
      } catch (error) {
        console.error("Auth success handling failed:", error)
        
        // Still try to close popup or redirect
        if (window.opener) {
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            timestamp: Date.now(),
            source: 'fallback-auth'
          }, '*')
          setTimeout(() => window.close(), 1000)
        } else {
          setTimeout(() => window.location.href = '/', 2000)
        }
      }
    }

    handleAuthSuccess()
  }, [instance])

  return (
    <div style={{ padding: "32px", textAlign: "center" }}>
      <Alert variant="success">
        <h2>Innlogging vellykket!</h2>
        <p>Du blir automatisk omdirigert...</p>
      </Alert>
    </div>
  )
}
