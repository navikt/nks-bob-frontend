import { Button, Alert } from "@navikt/ds-react"
import { useState } from "react"
import { isSalesforceMode, postMessageToParent } from "../../utils/iframe"
import { useMsalAuth } from "../../auth/useMsalAuth"

interface IframeLoginButtonProps {
  loginUrl: string
}

export const IframeLoginButton = ({ loginUrl }: IframeLoginButtonProps) => {
  const [showFallback, setShowFallback] = useState(false)
  const { login, isLoading, error } = useMsalAuth()

  const handleMsalLogin = async () => {
    try {
      await login()
      // If successful in iframe mode, notify parent and refresh
      if (isSalesforceMode()) {
        postMessageToParent('AUTH_SUCCESS', { timestamp: Date.now() })
        // Small delay then refresh
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error("MSAL login failed:", error)
      // Show fallback options after MSAL failure
      setShowFallback(true)
    }
  }

  const handleFallbackLogin = () => {
    // Use original popup approach as fallback
    const popupUrl = loginUrl.includes('?') 
      ? `${loginUrl}&popup=true` 
      : `${loginUrl}?popup=true`
    
    try {
      const popup = window.open(
        popupUrl,
        'auth-popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        postMessageToParent('AUTH_REQUIRED', { loginUrl })
        return
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.location.reload()
        }
      }, 1000)

      setTimeout(() => {
        if (!popup.closed) {
          clearInterval(checkClosed)
          popup.close()
          postMessageToParent('AUTH_REQUIRED', { loginUrl })
        }
      }, 300000) // 5 minutes
    } catch (error) {
      postMessageToParent('AUTH_REQUIRED', { loginUrl })
    }
  }

  const handleParentAuth = () => {
    postMessageToParent('AUTH_REQUIRED', { loginUrl })
  }

  if (!isSalesforceMode()) {
    return (
      <Button onClick={handleMsalLogin} loading={isLoading}>
        Logg inn med Microsoft
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleMsalLogin} loading={isLoading}>
        Logg inn med Microsoft (popup)
      </Button>
      
      {error && (
        <Alert variant="warning" size="small">
          Microsoft-innlogging feilet: {error}
        </Alert>
      )}
      
      {(showFallback || error) && (
        <Alert variant="info" size="small">
          <div className="space-y-3">
            <p>Microsoft-innlogging fungerte ikke. Prøv en av disse alternativene:</p>
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                size="small" 
                onClick={handleFallbackLogin}
              >
                Tradisjonell popup-innlogging
              </Button>
              <Button 
                variant="secondary" 
                size="small" 
                onClick={handleParentAuth}
              >
                Be Salesforce om å håndtere innlogging
              </Button>
              <Button 
                variant="tertiary" 
                size="small" 
                onClick={() => window.open(loginUrl, '_blank')}
              >
                Åpne innlogging i ny fane
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Hvis du logger inn i en ny fane, last denne siden på nytt etterpå.
            </p>
          </div>
        </Alert>
      )}
    </div>
  )
}