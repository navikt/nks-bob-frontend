// Iframe detection and communication utilities for Salesforce integration

export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top
  } catch (e) {
    return true // If we can't access window.top, we're likely in an iframe
  }
}

export const isSalesforceMode = (): boolean => {
  return import.meta.env.VITE_SALESFORCE_BUILD === 'true' || isInIframe()
}

export const postMessageToParent = (type: string, data?: any): void => {
  if (window.parent && window.parent !== window) {
    // Use specific Salesforce domain for security in production
    const targetOrigin = window.location.hostname.includes('lightning.force.com') 
      ? 'https://app-connect-7729.scratch.lightning.force.com'
      : '*' // Allow any origin in development
      
    window.parent.postMessage({
      type,
      data,
      source: 'nks-bob-iframe'
    }, targetOrigin)
  }
}

export const handleAuthenticationInIframe = (loginUrl: string): void => {
  if (isSalesforceMode()) {
    // Try popup first, fallback to parent messaging
    tryPopupAuth(loginUrl)
  } else {
    // Normal redirect for standalone app
    window.location.href = loginUrl
  }
}

const tryPopupAuth = (loginUrl: string): void => {
  try {
    // Add popup parameter to login URL
    const popupUrl = loginUrl.includes('?') 
      ? `${loginUrl}&popup=true` 
      : `${loginUrl}?popup=true`
    
    // Try to open popup for authentication
    const popup = window.open(
      popupUrl,
      'auth-popup',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      // Popup was blocked, fallback to parent messaging
      console.log('Popup blocked, falling back to parent window authentication')
      postMessageToParent('AUTH_REQUIRED', { loginUrl })
      return
    }

    // Monitor popup for completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        // Popup closed, try to refresh the app
        window.location.reload()
      }
    }, 1000)

    // Listen for auth success message from popup
    const messageHandler = (event: MessageEvent) => {
      if (event.source === popup && event.data?.type === 'AUTH_SUCCESS') {
        clearInterval(checkClosed)
        popup.close()
        window.removeEventListener('message', messageHandler)
        // Refresh to get new auth state
        window.location.reload()
      }
    }

    window.addEventListener('message', messageHandler)

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        clearInterval(checkClosed)
        popup.close()
        window.removeEventListener('message', messageHandler)
        // Fallback to parent messaging
        postMessageToParent('AUTH_REQUIRED', { loginUrl })
      }
    }, 300000) // 5 minutes

  } catch (error) {
    console.error('Failed to open auth popup:', error)
    // Fallback to parent messaging
    postMessageToParent('AUTH_REQUIRED', { loginUrl })
  }
}

// Listen for messages from parent (Salesforce)
export const setupIframeMessageListener = (): void => {
  if (!isSalesforceMode()) return

  window.addEventListener('message', (event) => {
    // Validate event origin for security
    const allowedOrigins = [
      'https://app-connect-7729.scratch.lightning.force.com',
      'http://localhost:5173', // Development
      'http://127.0.0.1:5173'  // Development
    ]
    
    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Ignored message from unauthorized origin:', event.origin)
      return
    }
    
    if (event.data?.source === 'salesforce-parent') {
      switch (event.data.type) {
        case 'AUTH_TOKEN':
          // Handle authentication token from parent
          handleAuthToken(event.data.token)
          break
        case 'RESIZE_IFRAME':
          // Handle iframe resize requests
          postMessageToParent('REQUEST_RESIZE', { height: document.body.scrollHeight })
          break
      }
    }
  })
}

const handleAuthToken = (token: string): void => {
  // Store token for API calls (consider using sessionStorage for iframe context)
  sessionStorage.setItem('salesforce_auth_token', token)
  // Refresh the app or trigger re-authentication
  window.location.reload()
}