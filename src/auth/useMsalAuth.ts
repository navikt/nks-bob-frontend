import { useEffect, useState } from "react"
import { AuthenticationResult } from "@azure/msal-browser"
import { msalService } from "./msalService"
import { isSalesforceMode } from "../utils/iframe"

interface AuthState {
  isAuthenticated: boolean
  account: any | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
}

export const useMsalAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    account: null,
    accessToken: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await msalService.initialize()
        
        // Handle redirect promise for redirect flow
        const response = await msalService.handleRedirectPromise()
        
        if (response) {
          setAuthState({
            isAuthenticated: true,
            account: response.account,
            accessToken: response.accessToken,
            isLoading: false,
            error: null,
          })
          return
        }

        // Check for existing active account
        const account = await msalService.getActiveAccount()
        
        if (account) {
          try {
            // Try to get token silently
            const tokenResponse = await msalService.acquireTokenSilent(["openid", "profile"])
            setAuthState({
              isAuthenticated: true,
              account: tokenResponse.account,
              accessToken: tokenResponse.accessToken,
              isLoading: false,
              error: null,
            })
          } catch (error) {
            // Silent token acquisition failed, user needs to login
            setAuthState({
              isAuthenticated: false,
              account: null,
              accessToken: null,
              isLoading: false,
              error: null,
            })
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            account: null,
            accessToken: null,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error("Auth initialization failed:", error)
        setAuthState({
          isAuthenticated: false,
          account: null,
          accessToken: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Authentication initialization failed",
        })
      }
    }

    initializeAuth()
  }, [])

  const login = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      let response: AuthenticationResult

      if (isSalesforceMode()) {
        // Use popup for iframe/Salesforce mode
        response = await msalService.loginPopup()
      } else {
        // Use redirect for standalone mode
        await msalService.loginRedirect()
        return // Redirect will handle the rest
      }

      setAuthState({
        isAuthenticated: true,
        account: response.account,
        accessToken: response.accessToken,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error("Login failed:", error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }))
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await msalService.logout()
      setAuthState({
        isAuthenticated: false,
        account: null,
        accessToken: null,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error("Logout failed:", error)
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Logout failed",
      }))
    }
  }

  const acquireToken = async (scopes: string[]): Promise<string | null> => {
    try {
      const response = await msalService.acquireTokenSilent(scopes)
      return response.accessToken
    } catch (error) {
      try {
        // Fallback to popup if silent fails
        const response = await msalService.acquireTokenPopup(scopes)
        return response.accessToken
      } catch (popupError) {
        console.error("Token acquisition failed:", popupError)
        return null
      }
    }
  }

  return {
    ...authState,
    login,
    logout,
    acquireToken,
  }
}