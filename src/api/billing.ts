import { api } from './client'

export function startCheckout(): Promise<{ url: string }> {
  return api<{ url: string }>('/api/billing/checkout', { method: 'POST' })
}

export function startPortal(): Promise<{ url: string }> {
  return api<{ url: string }>('/api/billing/portal', { method: 'POST' })
}
