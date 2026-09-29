import { api } from './client'

export type OnboardingStepName = 'begin' | 'identity' | 'direction'

export type Overview = {
  total_users: number
  new_users_today: number
  new_users_7d: number
  new_users_30d: number
  started_path: number
  days_completed: number
  active_users: number
  retention_1d: number | null
  retention_3d: number | null
  retention_7d: number | null
}

export type FunnelStep = {
  key: string
  label: string
  count: number
  percent_of_signups: number | null
  percent_of_previous: number | null
}

export type Cohort = {
  date: string
  size: number
  day_1: number | null
  day_3: number | null
  day_7: number | null
  day_14: number | null
}

export type Analytics = {
  overview: Overview
  funnel: FunnelStep[]
  cohorts: Cohort[]
}

export function loadAnalytics(): Promise<Analytics> {
  return api<Analytics>('/api/admin/analytics')
}

export function markOnboarding(step: OnboardingStepName): Promise<void> {
  return api<void>('/api/onboarding', {
    method: 'POST',
    body: JSON.stringify({ step }),
  }).catch(() => undefined)
}
