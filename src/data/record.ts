import { create } from 'zustand'

import { errorMessage } from '../api/client'
import {
  loadCatalog,
  loadTransformation,
  replaceCommitment,
  resetTransformation,
  scheduleCommitment,
  skipCommitment,
  showedUp as closeDay,
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
const ceremonyKey = 'yau-ceremony'

export type PhaseShift = {
  identity: string
  finishedName: string
  finishedHeadline: string
  length: number
  nextName: string | null
  nextHeadline: string | null
}

export type Ceremony = {
  shifts: PhaseShift[]
}

export function continueBecoming(statement: string) {
  const rest = statement.replace(/^I['’]m becoming\s+/i, '').replace(/\.$/, '')
  return `Tomorrow, you continue becoming ${rest}.`
}

export function phaseShifts(before: Transformation, after: Transformation): PhaseShift[] {
  return before.selections.flatMap((prev) => {
    if (prev.completed || prev.day_in_phase !== prev.length_days) return []
    const next = after.selections.find((item) => item.identity_id === prev.identity_id)
    if (!next) return []
    const pathComplete = next.completed && next.stage_name === prev.stage_name
    const moved = next.stage_name !== prev.stage_name
    if (!pathComplete && !moved) return []
    return [
      {
        identity: prev.identity_name,
        finishedName: prev.stage_name,
        finishedHeadline: prev.phase_name,
        length: prev.length_days,
        nextName: pathComplete ? null : next.stage_name,
        nextHeadline: pathComplete ? null : next.phase_name,
      },
    ]
  })
}

function ceremonyStorageKey(userId: string) {
  return `${ceremonyKey}:${userId}`
}

export function shiftsFor(userId: string | null, date: string): PhaseShift[] {
  if (!userId) return []
  try {
    const raw = sessionStorage.getItem(ceremonyStorageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as { date?: string; shifts?: PhaseShift[] }
    if (parsed.date !== date || !Array.isArray(parsed.shifts)) return []
    return parsed.shifts
  } catch {
    return []
  }
}

function writeCeremonyStore(userId: string | null, date: string, shifts: PhaseShift[]) {
  if (!userId) return
  sessionStorage.setItem(ceremonyStorageKey(userId), JSON.stringify({ date, shifts }))
}

function clearCeremonyStore(userId: string | null) {
  if (userId) sessionStorage.removeItem(ceremonyStorageKey(userId))
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
  accountId: string | null
  load: (userId: string) => Promise<void>
  forget: () => void
  toggleIdentity: (id: string) => void
  chooseDirection: (identityId: string, directionId: string) => void
  beginEdit: () => void
  start: () => Promise<void>
  saveSelections: () => Promise<void>
  toggle: (id: string) => Promise<void>
  replace: (id: string, implementationId: string) => Promise<void>
  skip: (id: string) => Promise<void>
  schedule: (id: string, body: { weekdays?: number[]; month_day?: number }) => Promise<void>
  showedUp: () => Promise<void>
  reset: () => Promise<void>
  clearCeremony: () => void
}

function draftKeyFor(userId: string) {
  return `${draftKey}:${userId}`
}

function readDraft(userId: string): { ids: string[]; directions: Record<string, string> } {
  try {
    const raw = sessionStorage.getItem(draftKeyFor(userId))
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
  const userId = useRecord.getState().accountId
  if (!userId) return
  sessionStorage.setItem(draftKeyFor(userId), JSON.stringify({ ids, directions }))
}

function clearDraft(userId: string | null) {
  sessionStorage.removeItem(draftKey)
  if (userId) sessionStorage.removeItem(draftKeyFor(userId))
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

export function shownIntensity(intensity: number, closed: boolean) {
  return closed ? Math.max(intensity, 1) : intensity
}

export function phaseLevels(year: YearDay[], selection: Selection, closed: boolean) {
  const moment = phaseMoment(selection, closed)
  const levels = Array.from({ length: moment.length }, () => 0)
  const finished = moment.filled === 0 ? [] : year.filter((day) => day.closed).slice(-moment.filled)
  const levelFor = (day: YearDay) =>
    day.identities.find((item) => item.identity_id === selection.identity_id)?.intensity ?? 0
  finished.forEach((day, index) => {
    if (index < levels.length) levels[index] = shownIntensity(levelFor(day), true)
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
  accountId: null,

  load: async (userId) => {
    set({
      status: 'loading',
      error: null,
      record: null,
      ceremony: null,
      accountId: userId,
      draftIdentityIds: [],
      draftDirections: {},
    })
    try {
      const [catalog, record] = await Promise.all([loadCatalog(), loadTransformation()])
      if (get().accountId !== userId) return
      const draft = record ? draftFrom(record) : readDraft(userId)
      set({
        status: record ? 'ready' : 'empty',
        catalog,
        record,
        draftIdentityIds: draft.ids,
        draftDirections: draft.directions,
        error: null,
        accountId: userId,
      })
    } catch (caught) {
      if (get().accountId !== userId) return
      set({ status: 'error', error: errorMessage(caught) })
    }
  },

  forget: () => {
    clearDraft(get().accountId)
    clearCeremonyStore(get().accountId)
    set({
      status: 'idle',
      record: null,
      error: null,
      pending: false,
      draftIdentityIds: [],
      draftDirections: {},
      ceremony: null,
      accountId: null,
    })
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
      clearDraft(get().accountId)
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

  showedUp: async () => {
    const before = get().record
    set({ pending: true, error: null })
    try {
      const record = await closeDay()
      const shifts = before ? phaseShifts(before, record) : []
      writeCeremonyStore(get().accountId, record.today.date, shifts)
      set({ record, pending: false, ceremony: { shifts } })
    } catch (caught) {
      set({ pending: false, error: errorMessage(caught) })
      throw caught
    }
  },

  reset: async () => {
    set({ pending: true, error: null })
    try {
      await resetTransformation()
      clearDraft(get().accountId)
      clearCeremonyStore(get().accountId)
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

  clearCeremony: () => {
    clearCeremonyStore(get().accountId)
    set({ ceremony: null })
  },
}))
