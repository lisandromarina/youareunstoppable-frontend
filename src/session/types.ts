export type Plan = 'free' | 'pro'
export type Role = 'user' | 'admin'
export type SessionStatus = 'unknown' | 'anonymous' | 'authenticated'

export type Subscription = {
  id: string
  plan: Plan
  subscription_status: string | null
  current_period_end: string | null
  deleted_at: string | null
  deleted_reason: string | null
}

export type User = {
  id: string
  email: string
  role: Role
  has_password: boolean
  last_connection: string | null
  subscription: Subscription
}
