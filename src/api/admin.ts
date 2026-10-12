import { api } from './client'
import { clientDate } from './record'

export type OnboardingStepName = 'begin' | 'identity' | 'direction'

export type Overview = {
  total_users: number
  new_users_today: number
  new_users_7d: number
  new_users_30d: number
  started_path: number
  days_completed: number
  active_users: number
  opened_today: number
  closed_today: number
  commitments_done: number
  commitments_skipped: number
  return_1d: number | null
  closed_1d: number | null
  return_3d: number | null
  closed_3d: number | null
  return_7d: number | null
  closed_7d: number | null
  day1_closure: number | null
}

export type FunnelStep = {
  key: string
  label: string
  count: number
  percent_of_signups: number | null
  percent_of_previous: number | null
}

export type CohortDay = {
  returned: number | null
  closed: number | null
}

export type Cohort = {
  date: string
  size: number
  day_1: CohortDay | null
  day_3: CohortDay | null
  day_7: CohortDay | null
  day_14: CohortDay | null
}

export type Analytics = {
  overview: Overview
  funnel: FunnelStep[]
  cohorts: Cohort[]
}

export function loadAnalytics(): Promise<Analytics> {
  return api<Analytics>(`/api/admin/analytics?on=${clientDate()}`)
}

export function markOnboarding(step: OnboardingStepName): Promise<void> {
  return api<void>('/api/onboarding', {
    method: 'POST',
    body: JSON.stringify({ step }),
  }).catch(() => undefined)
}
