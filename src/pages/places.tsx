import { useNavigate } from 'react-router'

import { DaySheet } from '../components/DaySheet'
import { JourneyGrid } from '../components/JourneyGrid'
import { Eyebrow, GhostButton, OutlineButton, PrimaryButton, Screen } from '../components/look'
import {
  TODAY_INDEX,
  coachPrompts,
  currentStreak,
  daysCompleted,
  longestStreak,
  useDay,
} from '../data/day'

const moods = ['Difficult', 'Okay', 'Good', 'Powerful']
const milestones: [number, string][] = [
  [1, 'The beginning.'],
  [7, 'You started building consistency.'],
  [30, "You're becoming someone different."],
  [90, 'This is no longer just motivation.'],
  [180, 'You built a lifestyle.'],
  [365, 'One year of showing up.'],
]

export function Today() {
  const navigate = useNavigate()
  const commitments = useDay((state) => state.commitments)
  const toggleCommitment = useDay((state) => state.toggleCommitment)
  const done = commitments.filter((item) => item.done).length

  return (
    <Screen className="pb-28 md:pb-12">
      <Eyebrow>Day {TODAY_INDEX + 1}</Eyebrow>
      <p className="-mt-1 text-[13px] font-semibold text-muted-foreground">September 21, 2026</p>
      <h1 className="mt-3.5 max-w-xl text-[28px] leading-tight font-extrabold">
        Today is another chance to prove it.
      </h1>
      <p className="mt-7 text-xs font-extrabold tracking-wide text-muted-foreground">Today's commitments</p>
      <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
        {commitments.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              const finished = toggleCommitment(index)
              if (finished) window.setTimeout(() => navigate('/day-complete'), 350)
            }}
            className={`flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 text-left ${item.done ? 'opacity-50 shadow-[inset_0_0_0_1px_#ff8906]' : ''}`}
          >
            <span className="w-28 shrink-0 text-[11px] font-extrabold tracking-wide text-primary">
              0{index + 1} — {item.title}
            </span>
            <span className={`flex-1 text-[12.5px] text-muted-foreground ${item.done ? 'line-through' : ''}`}>
              {item.detail}
            </span>
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${item.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
            >
              {item.done ? '✓' : ''}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-[20px] border border-border bg-card p-5">
        <div className="flex justify-between text-[13px] font-bold">
          <span>Today</span>
          <span className="text-primary">
            {done} / {commitments.length} commitments
          </span>
        </div>
        <div className="mt-3 flex gap-1">
          {commitments.map((item) => (
            <span
              key={item.title}
              className={`h-2 flex-1 rounded ${item.done ? 'bg-primary' : 'bg-empty'}`}
            />
          ))}
        </div>
      </div>
      <OutlineButton className="mt-4" type="button" onClick={() => navigate('/coach')}>
        Talk to your coach
      </OutlineButton>
    </Screen>
  )
}

export function DayComplete() {
  const navigate = useNavigate()
  const completeToday = useDay((state) => state.completeToday)

  return (
    <Screen className="min-h-svh items-center justify-center text-center">
      <Eyebrow>Day complete</Eyebrow>
      <div className="my-8 size-[120px] rounded-[26px] bg-primary shadow-[0_0_50px_rgba(255,137,6,0.5)]" />
      <h1 className="text-[26px] font-extrabold">You showed up.</h1>
      <p className="mt-3 text-[15.5px] text-muted-foreground">Day {TODAY_INDEX + 1} added to your journey.</p>
      <PrimaryButton
        className="mt-10"
        type="button"
        onClick={() => {
          completeToday()
          navigate('/journey')
        }}
      >
        See my journey →
      </PrimaryButton>
      <GhostButton className="mt-1" type="button" onClick={() => navigate('/check-in')}>
        Reflect on today
      </GhostButton>
    </Screen>
  )
}

export function CheckIn() {
  const navigate = useNavigate()
  const commitments = useDay((state) => state.commitments)
  const mood = useDay((state) => state.mood)
  const reflection = useDay((state) => state.reflection)
  const setMood = useDay((state) => state.setMood)
  const setReflection = useDay((state) => state.setReflection)
  const saveReflection = useDay((state) => state.saveReflection)

  return (
    <Screen className="min-h-svh">
      <h1 className="text-[25px] font-extrabold">Did you show up?</h1>
      <div className="mt-5 rounded-[20px] border border-border bg-card p-5">
        {commitments.map((item) => (
          <p key={item.title} className="flex items-center gap-2.5 py-1.5 text-sm font-semibold">
            <span className="text-primary">{item.done ? '✓' : '○'}</span>
            {item.title}
          </p>
        ))}
      </div>
      <p className="mt-6 text-[13px] font-bold tracking-wide">How did today feel?</p>
      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {moods.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMood(item)}
            className={`rounded-[14px] border px-2 py-3.5 text-[12.5px] font-bold ${mood === item ? 'border-primary bg-[linear-gradient(135deg,rgba(255,137,6,0.14),rgba(255,137,6,0.03))] text-primary' : 'border-border bg-card'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[13px] font-bold tracking-wide">What did today teach you?</p>
      <textarea
        className="mt-2.5 min-h-28 w-full rounded-2xl border border-border bg-card px-4 py-4 text-[15.5px] outline-none focus:border-primary"
        placeholder="Today I realized…"
        value={reflection}
        onChange={(event) => setReflection(event.target.value)}
      />
      <PrimaryButton
        className="mt-8"
        type="button"
        onClick={() => {
          saveReflection()
          navigate('/journey')
        }}
      >
        Complete my day →
      </PrimaryButton>
    </Screen>
  )
}

export function Journey() {
  const grid = useDay((state) => state.grid)
  const showToast = useDay((state) => state.showToast)
  const completed = daysCompleted(grid)
  const streak = currentStreak(grid)
  const longest = longestStreak(grid)
  const stats = [
    [completed, 'Days completed'],
    [streak, 'Current streak'],
    [longest, 'Longest streak'],
    ['87%', 'Commitments completed'],
  ] as const

  return (
    <Screen className="pb-28 md:pb-12">
      <Eyebrow>Your journey</Eyebrow>
      <h1 className="text-[27px] font-extrabold">{completed} days of becoming.</h1>
      <div className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[30px] font-extrabold tracking-tight text-primary">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-7">
        <JourneyGrid />
      </div>
      <p className="mt-1.5 text-[12.5px] text-muted-foreground">Tap a filled square to revisit that day.</p>
      <Eyebrow className="mt-8">Milestones</Eyebrow>
      <div className="mt-1">
        {milestones.map(([day, line]) => {
          const reached = TODAY_INDEX + 1 >= day
          return (
            <div key={day} className="flex items-baseline gap-3.5 border-b border-border py-3.5 last:border-b-0">
              <span className="w-16 shrink-0 text-[13px] font-extrabold text-primary">Day {day}</span>
              <span className={`text-sm font-semibold ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>
                {line}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-6 rounded-3xl border border-primary bg-[linear-gradient(160deg,#1c1826,#0f0e17)] p-7 text-center">
        <p className="text-[26px] font-extrabold text-primary">{completed} days</p>
        <p className="mt-0.5 text-[13px] font-bold tracking-wide">Of becoming</p>
        <p className="mt-2.5 text-sm font-bold">{streak} day streak</p>
        <p className="mt-3.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground">YouAreUnstoppable</p>
        <OutlineButton className="mt-4" type="button" onClick={() => showToast('Card ready to share.')}>
          Share my journey
        </OutlineButton>
      </div>
      <DaySheet />
    </Screen>
  )
}

export function Journal() {
  const navigate = useNavigate()
  const journal = useDay((state) => state.journal)

  return (
    <Screen className="pb-28 md:pb-12">
      <Eyebrow>Your thoughts</Eyebrow>
      <h1 className="text-[25px] font-extrabold">Journal</h1>
      <div className="mt-4 max-w-3xl">
        {journal.map((entry) => (
          <article key={`${entry.date}-${entry.text}`} className="border-b border-border py-4 last:border-b-0">
            <p className="text-xs font-extrabold text-primary">{entry.date}</p>
            <p className="mt-1.5 text-[15px] leading-normal italic">"{entry.text}"</p>
          </article>
        ))}
      </div>
      <OutlineButton className="mt-4" type="button" onClick={() => navigate('/check-in')}>
        Add today's reflection
      </OutlineButton>
    </Screen>
  )
}

export function Coach() {
  const navigate = useNavigate()
  const coach = useDay((state) => state.coach)
  const askCoach = useDay((state) => state.askCoach)

  return (
    <Screen className="min-h-svh pb-28 md:pb-12">
      <Eyebrow>Your coach</Eyebrow>
      <h1 className="text-[25px] font-extrabold">Built on your data.</h1>
      <div className="mt-6 grid gap-2.5 lg:grid-cols-2">
        {coach.map((message, index) => (
          <p key={`${index}-${message}`} className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm leading-normal">
            {message}
          </p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {coachPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => askCoach(prompt)}
            className="rounded-full border border-border bg-card px-4 py-2.5 text-[13.5px] font-semibold"
          >
            {prompt}
          </button>
        ))}
      </div>
      <GhostButton className="mt-4" type="button" onClick={() => navigate('/today')}>
        Back to today
      </GhostButton>
    </Screen>
  )
}
