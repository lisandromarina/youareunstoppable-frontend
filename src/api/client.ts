export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type SessionHandlers = {
  onUnauthenticated: () => void
  onClosed: (message: string) => void
}

let handlers: SessionHandlers | null = null
let refreshInFlight: Promise<boolean> | null = null

export function installSessionHandlers(next: SessionHandlers) {
  handlers = next
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Request failed.'
}

function messageFromDetail(detail: unknown): string {
  if (typeof detail === 'string' && detail.length > 0) return detail
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string') {
          return item.msg
        }
        return ''
      })
      .filter((part) => part.length > 0)
    if (parts.length > 0) return parts.join(' ')
  }
  return 'Request failed.'
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown }
    return messageFromDetail(body.detail)
  } catch {
    return 'Request failed.'
  }
}

// Login and Google use 401 when the credential is rejected. Refreshing would hide
// that message and rotate a session the person has not entered.
function skipsRefresh(path: string): boolean {
  return (
    path === '/api/auth/login' ||
    path === '/api/auth/google' ||
    path === '/api/auth/register' ||
    path === '/api/auth/refresh'
  )
}

async function performRefresh(): Promise<boolean> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (response.status === 403) {
    throw new ApiError(403, await readError(response))
  }
  if (response.status === 401) return false
  if (!response.ok) {
    throw new ApiError(response.status, await readError(response))
  }
  return true
}

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export async function api<T>(path: string, init: RequestInit = {}, allowRefresh = true): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && allowRefresh && !skipsRefresh(path)) {
    try {
      const refreshed = await refreshSession()
      if (!refreshed) {
        handlers?.onUnauthenticated()
        throw new ApiError(401, 'Not authenticated.')
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        handlers?.onClosed(error.message)
      }
      throw error
    }
    return api<T>(path, init, false)
  }

  if (response.status === 403) {
    const message = await readError(response)
    handlers?.onClosed(message)
    throw new ApiError(403, message)
  }

  if (response.status === 401) {
    if (!allowRefresh) handlers?.onUnauthenticated()
    throw new ApiError(401, await readError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response))
  }

  return (await response.json()) as T
}
