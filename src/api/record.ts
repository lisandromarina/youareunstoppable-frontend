import { ApiError, api } from './client'

export type CatalogImplementation = {
  id: string
  title: string
}

export type Recurrence = 'daily' | 'times_per_week' | 'weekly' | 'monthly' | 'once'

export type CatalogCommitment = {
  id: string
  objective: string
  unlock_streak: number
  kind: 'base' | 'extra'
  recurrence: Recurrence
  times_per_week: number | null
  weekdays: number[]
  month_day: number | null
  implementations: CatalogImplementation[]
}

export type CatalogPhase = {
  id: string
  name: string
  headline: string
  length_days: number
  commitments: CatalogCommitment[]
}

export type CatalogDirection = {
  id: string
  name: string
  phases: CatalogPhase[]
}

export type CatalogIdentity = {
  id: string
  name: string
  directions: CatalogDirection[]
}

export type Catalog = {
  identities: CatalogIdentity[]
}

export type Implementation = {
  id: string
  title: string
}

export type Commitment = {
  id: string
  planned_commitment_id: string | null
  objective: string
  cadence: string
  recurrence: Recurrence
  times_per_week: number | null
  weekdays: number[]
  month_day: number | null
  due_on: string | null
  reason: string | null
  implementation: Implementation
  implementations: Implementation[]
  status: 'open' | 'done' | 'skipped'
}

export type Upcoming = {
  planned_commitment_id: string
  identity_name: string
  objective: string
  title: string
  cadence: string
  recurrence: Recurrence
  times_per_week: number | null
  weekdays: number[]
  month_day: number | null
  due_on: string | null
  when: string
}

export type TodayGroup = {
  identity_id: string
  identity_name: string
  commitments: Commitment[]
}

export type Phase = {
  name: string
  headline: string
  status: 'complete' | 'current' | 'upcoming'
  length_days: number
}

export type Selection = {
  identity_id: string
  identity_name: string
  direction_id: string
  direction_name: string
  phase_name: string
  stage_name: string
  day_in_phase: number
  length_days: number
  active_commitments: number
  completed: boolean
  phases: Phase[]
}

export type YearDay = {
  date: string
  intensity: number
  closed: boolean
  today: boolean
  identities: { identity_id: string; intensity: number }[]
}

export type TomorrowItem = {
  identity_name: string
  title: string
  cadence: string
}

export type Transformation = {
  statement: string
  selections: Selection[]
  today: {
    date: string
    closed: boolean
    groups: TodayGroup[]
    coming_up: Upcoming[]
  }
  progress: {
    phase_name: string
    day_in_phase: number
    length_days: number
    commitments_done: number
    commitments_total: number
    next_phase_name: string | null
  }
  year: YearDay[]
  promises_kept: number
  started_on: string
  tomorrow?: TomorrowItem[]
  prior_closed_on?: string | null
}

export type SelectionInput = {
  identity_id: string
  direction_id: string
}

export function clientDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function withOn(path: string): string {
  const join = path.includes('?') ? '&' : '?'
  return `${path}${join}on=${clientDate()}`
}

export function loadCatalog(): Promise<Catalog> {
  return api<Catalog>('/api/catalog')
}

export async function loadTransformation(): Promise<Transformation | null> {
  try {
    return await api<Transformation>(withOn('/api/transformation'))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function startTransformation(selections: SelectionInput[]): Promise<Transformation> {
  return api<Transformation>(withOn('/api/transformation'), {
    method: 'POST',
    body: JSON.stringify({ selections }),
  })
}

export function updateTransformation(selections: SelectionInput[]): Promise<Transformation> {
  return api<Transformation>(withOn('/api/transformation'), {
    method: 'PUT',
    body: JSON.stringify({ selections }),
  })
}

export function resetTransformation(): Promise<void> {
  return api<void>('/api/transformation', { method: 'DELETE' })
}

export function toggleCommitment(id: string): Promise<Transformation> {
  return api<Transformation>(withOn(`/api/transformation/today/commitments/${id}/toggle`), {
    method: 'POST',
  })
}

export function replaceCommitment(id: string, implementationId: string): Promise<Transformation> {
  return api<Transformation>(withOn(`/api/transformation/today/commitments/${id}/replace`), {
    method: 'POST',
    body: JSON.stringify({ implementation_id: implementationId }),
  })
}

export function skipCommitment(id: string): Promise<Transformation> {
  return api<Transformation>(withOn(`/api/transformation/today/commitments/${id}/skip`), {
    method: 'POST',
  })
}

export function scheduleCommitment(
  id: string,
  body: { weekdays?: number[]; month_day?: number },
): Promise<Transformation> {
  return api<Transformation>(withOn(`/api/transformation/commitments/${id}/schedule`), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
