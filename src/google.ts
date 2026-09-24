type GoogleCredential = {
  credential: string
}

type GoogleId = {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredential) => void
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      theme: string
      size: string
      text: string
      shape: string
      width: number
    },
  ) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleId
      }
    }
  }
}

let loading: Promise<void> | null = null

export function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Google sign-in could not be loaded.'))
      document.head.appendChild(script)
    })
  }
  return loading
}
