import { Configuration, LogLevel } from "@azure/msal-browser"

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "your-client-id",
    authority: import.meta.env.VITE_AZURE_AUTHORITY || "https://login.microsoftonline.com/62366534-1ec3-4962-8869-9b5535279d0b",
    redirectUri: window.location.origin + "/auth/success",
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // This is better for iframe scenarios
    storeAuthStateInCookie: false, // Set to true for IE 11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
        }
      },
    },
  },
}

// Add scopes here for ID token to be used at UserInfo endpoint
export const loginRequest = {
  scopes: ["openid", "profile", "User.Read"],
  prompt: "select_account",
}

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
}