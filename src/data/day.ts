import { create } from 'zustand'

export const TODAY_INDEX = 186
export const TOTAL_DAYS = 365

export type Commitment = {
  title: string
  detail: string
  done: boolean
}

export type JournalEntry = {
  date: string
  text: string
}

const commitments: Commitment[] = [
  { title: 'TRAIN', detail: '45 min workout', done: false },
  { title: 'BUILD', detail: '60 min focused work', done: false },
  { title: 'LEARN', detail: 'Read 20 pages', done: false },
  { title: 'DISCIPLINE', detail: 'No phone for the first 30 minutes', done: false },
]

const coachReplies: Record<string, string> = {
  'Plan tomorrow':
    "Lead with your workout tomorrow. That's when your consistency is strongest. Everything else follows once the hardest thing is done.",
  "I'm procrastinating": "Don't try to finish everything. Start with 10 minutes. You said you'd do it.",
  "I'm losing motivation":
    "Motivation isn't the requirement. Showing up is. Don't break the chain. Do the smallest version of today's commitments.",
  'Review my progress':
    "You've been showing up. The grid is the proof. Keep the promise you made to yourself.",
}

function buildGrid(): number[] {
  let seed = 42
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const days: number[] = []
  for (let index = 0; index < TOTAL_DAYS; index += 1) {
    if (index >= TODAY_INDEX) {
      days.push(0)
      continue
    }
    const roll = random()
    if (roll < 0.12) days.push(0)
    else if (roll < 0.35) days.push(1)
    else if (roll < 0.75) days.push(2)
    else days.push(3)
  }
  return days
}

type DayState = {
  grid: number[]
  commitments: Commitment[]
  mood: string | null
  reflection: string
  journal: JournalEntry[]
  coach: string[]
  sheetDay: number | null
  toast: string | null
  toggleCommitment: (index: number) => boolean
  setMood: (mood: string) => void
  setReflection: (value: string) => void
  saveReflection: () => void
  askCoach: (prompt: string) => void
  completeToday: () => void
  openDay: (index: number) => void
  closeDay: () => void
  showToast: (message: string) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useDay = create<DayState>((set, get) => ({
  grid: buildGrid(),
  commitments,
  mood: null,
  reflection: '',
  journal: [
    { date: 'September 19', text: 'Had a terrible day but still completed my work.' },
    { date: 'September 15', text: "Starting to feel like I'm actually changing." },
  ],
  coach: [
    'You completed 6 of your last 7 days.',
    'Your consistency is strongest when you train in the morning.',
    'Tomorrow, I recommend making your workout your first commitment.',
  ],
  sheetDay: null,
  toast: null,

  toggleCommitment: (index) => {
    const current = get().commitments
    const next = current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, done: !item.done } : item,
    )
    const turnedOn = next[index]?.done === true && current[index]?.done === false
    set({ commitments: next })
    if (turnedOn) get().showToast("Another vote for who you're becoming.")
    return next.every((item) => item.done)
  },

  setMood: (mood) => set({ mood }),
  setReflection: (reflection) => set({ reflection }),

  saveReflection: () => {
    const note = get().reflection.trim()
    if (!note) return
    set((state) => ({
      journal: [{ date: 'September 21', text: note }, ...state.journal],
    }))
  },

  askCoach: (prompt) => {
    const reply = coachReplies[prompt]
    if (!reply) return
    set((state) => ({ coach: [...state.coach, prompt, reply] }))
  },

  completeToday: () => {
    set((state) => {
      const grid = state.grid.slice()
      grid[TODAY_INDEX] = 3
      return { grid }
    })
  },

  openDay: (index) => {
    const value = get().grid[index]
    if (value === 0 && index !== TODAY_INDEX) return
    set({ sheetDay: index })
  },

  closeDay: () => set({ sheetDay: null }),

  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ toast: message })
    toastTimer = setTimeout(() => set({ toast: null }), 2200)
  },
}))

export const coachPrompts = Object.keys(coachReplies)

export function daysCompleted(grid: number[]) {
  return grid.slice(0, TODAY_INDEX + 1).filter((value) => value >= 1).length
}

export function currentStreak(grid: number[]) {
  let streak = 0
  for (let index = TODAY_INDEX - 1; index >= 0; index -= 1) {
    if (grid[index] >= 1) streak += 1
    else break
  }
  return streak
}

export function longestStreak(grid: number[]) {
  let best = 0
  let run = 0
  for (let index = 0; index <= TODAY_INDEX; index += 1) {
    if (grid[index] >= 1) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }
  return best
}
