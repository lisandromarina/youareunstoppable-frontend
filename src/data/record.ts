import { create } from 'zustand'

import { errorMessage } from '../api/client'
import {
  loadCatalog,
  loadTransformation,
  replaceCommitment,
  resetTransformation,
  scheduleCommitment,
  showedUp,
  skipCommitment,
  startTransformation,
  toggleCommitment,
  updateTransformation,
  type Catalog,
  type Selection,
  type SelectionInput,
  type Transformation,
  type YearDay,
} from '../api/record'

const draftKey = 'yau-onboarding'

export type Ceremony = {
  day: number
  length: number
  phase: string
  next: { identity: string; line: string }[]
}

export function nextStepLine(selection: Selection): string {
  if (selection.completed) return 'This path is complete. Tomorrow keeps the same promises.'
  if (selection.day_in_phase === 1) return `Tomorrow starts ${selection.phase_name}. Day 1.`
  return `Tomorrow is day ${selection.day_in_phase} of ${selection.phase_name}.`
}

type Status = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

type RecordState = {
  status: Status
  catalog: Catalog | null
  record: Transformation | null
  error: string | null
  pending: boolean
  draftIdentityIds: string[]
  draftDirections: Record<string, string>
  ceremony: Ceremony | null
  load: () => Promise<void>
  toggleIdentity: (id: string) => void
  chooseDirection: (identityId: string, directionId: string) => void
  beginEdit: () => void
  start: () => Promise<void>
  saveSelections: () => Promise<void>
  toggle: (id: string) => Promise<void>
  replace: (id: string, implementationId: string) => Promise<void>
  skip: (id: string) => Promise<void>
  schedule: (id: string, body: { weekdays?: number[]; month_day?: number }) => Promise<void>
  showUp: () => Promise<void>
  reset: () => Promise<void>
  clearCeremony: () => void
}

function readDraft(): { ids: string[]; directions: Record<string, string> } {
  try {
    const raw = sessionStorage.getItem(draftKey)
    if (!raw) return { ids: [], directions: {} }
    const parsed = JSON.parse(raw) as { ids?: string[]; directions?: Record<string, string> }
    return {
      ids: Array.isArray(parsed.ids) ? parsed.ids.slice(0, 2) : [],
      directions: parsed.directions ?? {},
    }
  } catch {
    return { ids: [], directions: {} }
  }
}

function writeDraft(ids: string[], directions: Record<string, string>) {
  sessionStorage.setItem(draftKey, JSON.stringify({ ids, directions }))
}

function draftFrom(record: Transformation): { ids: string[]; directions: Record<string, string> } {
  return {
    ids: record.selections.map((item) => item.identity_id),
    directions: Object.fromEntries(
      record.selections.map((item) => [item.identity_id, item.direction_id]),
    ),
  }
}

function selectionsOf(ids: string[], directions: Record<string, string>): SelectionInput[] {
  return ids.map((id) => ({ identity_id: id, direction_id: directions[id] }))
}

export function phaseMoment(selection: Selection, closed: boolean) {
  if (selection.completed && closed) {
    return {
      day: selection.length_days,
      length: selection.length_days,
      phase: selection.phase_name,
      filled: selection.length_days,
    }
  }
  if (closed && selection.day_in_phase === 1) {
    const previous = [...selection.phases].reverse().find((phase) => phase.status === 'complete')
    if (previous) {
      return {
        day: previous.length_days,
        length: previous.length_days,
        phase: previous.headline,
        filled: previous.length_days,
      }
    }
  }
  if (closed) {
    const day = Math.max(1, selection.day_in_phase - 1)
    return {
      day,
      length: selection.length_days,
      phase: selection.phase_name,
      filled: day,
    }
  }
  return {
    day: selection.day_in_phase,
    length: selection.length_days,
    phase: selection.phase_name,
    filled: Math.max(0, selection.day_in_phase - 1),
  }
}

export function phaseLevels(year: YearDay[], selection: Selection, closed: boolean) {
  const moment = phaseMoment(selection, closed)
  const levels = Array.from({ length: moment.length }, () => 0)
  const finished = moment.filled === 0 ? [] : year.filter((day) => day.closed).slice(-moment.filled)
  const levelFor = (day: YearDay) =>
    day.identities.find((item) => item.identity_id === selection.identity_id)?.intensity ?? 0
  finished.forEach((day, index) => {
    if (index < levels.length) levels[index] = levelFor(day)
  })
  if (!closed && moment.filled < levels.length) {
    const today = year.find((day) => day.today)
    if (today) levels[moment.filled] = levelFor(today)
  }
  return levels
}

export function phaseCursor(selection: Selection, closed: boolean) {
  const moment = phaseMoment(selection, closed)
  if (closed) return moment.filled - 1
  return moment.filled < moment.length ? moment.filled : -1
}

export const useRecord = create<RecordState>((set, get) => ({
  status: 'idle',
  catalog: null,
  record: null,
  error: null,
  pending: false,
  draftIdentityIds: [],
  draftDirections: {},
  ceremony: null,

  load: async () => {
    set({ status: 'loading', error: null })
    try {
      const [catalog, record] = await Promise.all([loadCatalog(), loadTransformation()])
      const stored = readDraft()
      const draft = record ? draftFrom(record) : stored
      set({
        status: record ? 'ready' : 'empty',
        catalog,
        record,
        draftIdentityIds: draft.ids,
        draftDirections: draft.directions,
        error: null,
      })
    } catch (caught) {
      set({ status: 'error', error: errorMessage(caught) })
    }
  },

  toggleIdentity: (id) => {
    const current = get().draftIdentityIds
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length >= 2
        ? current
        : [...current, id]
    const directions = { ...get().draftDirections }
    for (const key of Object.keys(directions)) {
      if (!next.includes(key)) delete directions[key]
    }
    writeDraft(next, directions)
    set({ draftIdentityIds: next, draftDirections: directions })
  },

  chooseDirection: (identityId, directionId) => {
    const directions = { ...get().draftDirections, [identityId]: directionId }
    writeDraft(get().draftIdentityIds, directions)
    set({ draftDirections: directions })
  },

  beginEdit: () => {
    const record = get().record
    if (!record) return
    const draft = draftFrom(record)
    writeDraft(draft.ids, draft.directions)
    set({ draftIdentityIds: draft.ids, draftDirections: draft.directions })
  },

  start: async () => {
    const { draftIdentityIds, draftDirections } = get()
    set({ pending: true, error: null })
    try {
      const record = await startTransformation(selectionsOf(draftIdentityIds, draftDirections))
      sessionStorage.removeItem(draftKey)
      set({ record, status: 'ready', pending: false })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  saveSelections: async () => {
    const { draftIdentityIds, draftDirections } = get()
    set({ pending: true, error: null })
    try {
      const record = await updateTransformation(selectionsOf(draftIdentityIds, draftDirections))
      set({ record, status: 'ready', pending: false })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  toggle: async (id) => {
    set({ pending: true, error: null })
    try {
      const record = await toggleCommitment(id)
      set({ record, pending: false })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
    }
  },

  replace: async (id, implementationId) => {
    set({ pending: true, error: null })
    try {
      const record = await replaceCommitment(id, implementationId)
      set({ record, pending: false })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  skip: async (id) => {
    set({ pending: true, error: null })
    try {
      const record = await skipCommitment(id)
      set({ record, pending: false })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  schedule: async (id, body) => {
    set({ pending: true, error: null })
    try {
      const record = await scheduleCommitment(id, body)
      set({ record, pending: false })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  showUp: async () => {
    const record = get().record
    const primary = record?.selections[0]
    if (!record || !primary) return
    set({ pending: true, error: null })
    try {
      const next = await showedUp()
      set({
        record: next,
        pending: false,
        ceremony: {
          day: primary.day_in_phase,
          length: primary.length_days,
          phase: primary.phase_name,
          next: next.selections.map((selection) => ({
            identity: selection.identity_name,
            line: nextStepLine(selection),
          })),
        },
      })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  reset: async () => {
    set({ pending: true, error: null })
    try {
      await resetTransformation()
      sessionStorage.removeItem(draftKey)
      set({
        record: null,
        status: 'empty',
        pending: false,
        draftIdentityIds: [],
        draftDirections: {},
        ceremony: null,
      })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  clearCeremony: () => set({ ceremony: null }),
}))
