import { PublicClientApplication, AuthenticationResult, PopupRequest } from "@azure/msal-browser"
import { msalConfig, loginRequest } from "./msalConfig"

class MSALService {
  private msalInstance: PublicClientApplication

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig)
  }

  async initialize(): Promise<void> {
    await this.msalInstance.initialize()
  }

  async loginPopup(): Promise<AuthenticationResult> {
    try {
      const popupRequest: PopupRequest = {
        ...loginRequest,
        redirectUri: window.location.origin + "/auth/success",
      }

      const response = await this.msalInstance.loginPopup(popupRequest)
      return response
    } catch (error) {
      console.error("MSAL popup login failed:", error)
      throw error
    }
  }

  async loginRedirect(): Promise<void> {
    try {
      await this.msalInstance.loginRedirect({
        ...loginRequest,
        redirectUri: window.location.origin + "/auth/success",
      })
    } catch (error) {
      console.error("MSAL redirect login failed:", error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await this.msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      })
    } catch (error) {
      console.error("MSAL logout failed:", error)
      throw error
    }
  }

  async getActiveAccount() {
    return this.msalInstance.getActiveAccount()
  }

  async getAllAccounts() {
    return this.msalInstance.getAllAccounts()
  }

  async acquireTokenSilent(scopes: string[]): Promise<AuthenticationResult> {
    const account = this.msalInstance.getActiveAccount()
    if (!account) {
      throw new Error("No active account found")
    }

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        scopes,
        account,
      })
      return response
    } catch (error) {
      console.error("Silent token acquisition failed:", error)
      throw error
    }
  }

  async acquireTokenPopup(scopes: string[]): Promise<AuthenticationResult> {
    try {
      const response = await this.msalInstance.acquireTokenPopup({
        scopes,
      })
      return response
    } catch (error) {
      console.error("Popup token acquisition failed:", error)
      throw error
    }
  }

  handleRedirectPromise(): Promise<AuthenticationResult | null> {
    return this.msalInstance.handleRedirectPromise()
  }
}

export const msalService = new MSALService()