import { api } from './client'

export function billingStatus(): Promise<{ enabled: boolean }> {
  return api<{ enabled: boolean }>('/api/billing')
}

export function startCheckout(): Promise<{ url: string }> {
  return api<{ url: string }>('/api/billing/checkout', { method: 'POST' })
}

export function startPortal(): Promise<{ url: string }> {
  return api<{ url: string }>('/api/billing/portal', { method: 'POST' })
}
