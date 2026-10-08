import { api } from './client'
import { clientDate, type Recurrence, type Transformation } from './record'

export type CoachGoal = {
  identity_id: string
  objective: string
  title: string
  recurrence: Recurrence
  due_on: string | null
  weekdays: number[]
  times_per_week: number | null
  month_day: number | null
  position: number
  reason: string | null
}

export type CoachProposal = {
  type: 'plan' | 'today'
  rationale: string | null
  goals: CoachGoal[]
}

export type CoachTurn = {
  role: 'user' | 'coach'
  content: string
}

export type CoachThread = {
  transcript: CoachTurn[]
  proposal: CoachProposal | null
}

export type CoachMessage = {
  reply: string
  proposal: CoachProposal | null
}

function withOn(path: string): string {
  return `${path}?on=${clientDate()}`
}

export function loadCoachThread(): Promise<CoachThread> {
  return api<CoachThread>(withOn('/api/coach'))
}

export function sendCoachMessage(message: string): Promise<CoachMessage> {
  return api<CoachMessage>(withOn('/api/coach/messages'), {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export function applyCoach(): Promise<Transformation> {
  return api<Transformation>(withOn('/api/coach/apply'), { method: 'POST' })
}
