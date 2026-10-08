import type { User } from './types'

const OPEN = new Set(['active', 'trialing', 'past_due'])

export function coachEntitled(user: User | null | undefined): boolean {
  if (!user) return false
  return user.subscription.plan === 'pro' && OPEN.has(user.subscription.subscription_status ?? '')
}
