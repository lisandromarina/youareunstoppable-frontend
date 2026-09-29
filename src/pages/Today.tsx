import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { cn } from 'cn'
import type { Commitment, Upcoming } from '../api/record'
import { PremiumSoon } from '../components/PremiumSoon'
import { Sheet, SheetChoice } from '../components/Sheet'
import { Screen } from '../components/look'
import { phaseMoment, useRecord } from '../data/record'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Schedulable = {
  planned_commitment_id: string | null
  title: string
  recurrence: Commitment['recurrence']
  times_per_week: number | null
  weekdays: number[]
  month_day: number | null
}

type SheetState =
  | { kind: 'menu' | 'replace' | 'skip'; commitment: Commitment }
  | { kind: 'days'; target: Schedulable }
  | null

function goalsOf(commitments: Commitment[]) {
  const names: string[] = []
  const grouped = new Map<string, Commitment[]>()
  for (const item of commitments) {
    if (!grouped.has(item.objective)) {
      names.push(item.objective)
      grouped.set(item.objective, [])
    }
    grouped.get(item.objective)?.push(item)
  }
  return names.map((name) => ({ name, items: grouped.get(name) ?? [] }))
}

function fromCommitment(commitment: Commitment): Schedulable {
  return {
    planned_commitment_id: commitment.planned_commitment_id,
    title: commitment.implementation.title,
    recurrence: commitment.recurrence,
    times_per_week: commitment.times_per_week,
    weekdays: commitment.weekdays,
    month_day: commitment.month_day,
  }
}

function fromUpcoming(item: Upcoming): Schedulable {
  return {
    planned_commitment_id: item.planned_commitment_id,
    title: item.title,
    recurrence: item.recurrence,
    times_per_week: item.times_per_week,
    weekdays: item.weekdays,
    month_day: item.month_day,
  }
}

export function Today() {
  const navigate = useNavigate()
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)
  const pending = useRecord((state) => state.pending)
  const error = useRecord((state) => state.error)
  const toggle = useRecord((state) => state.toggle)
  const replace = useRecord((state) => state.replace)
  const skip = useRecord((state) => state.skip)
  const schedule = useRecord((state) => state.schedule)
  const showUp = useRecord((state) => state.showUp)
  const [sheet, setSheet] = useState<SheetState>(null)
  const [showDone, setShowDone] = useState(false)
  const [days, setDays] = useState<number[]>([])
  const [monthDay, setMonthDay] = useState(1)

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record) return null

  const primary = record.selections[0]
  const moment = primary ? phaseMoment(primary, record.today.closed) : null
  const commitments = record.today.groups.flatMap((group) => group.commitments)
  const ready = commitments.every((item) => item.status !== 'open')
  const closed = record.today.closed
  const dayTarget = sheet?.kind === 'days' ? sheet.target : null
  const needed =
    dayTarget?.recurrence === 'weekly' ? 1 : (dayTarget?.times_per_week ?? dayTarget?.weekdays.length ?? 0)
  const canSaveDays = dayTarget?.recurrence === 'monthly' || days.length === needed

  function openDays(target: Schedulable) {
    setDays(target.weekdays)
    setMonthDay(target.month_day ?? 1)
    setSheet({ kind: 'days', target })
  }

  function toggleDay(day: number) {
    if (!dayTarget) return
    if (dayTarget.recurrence === 'weekly') {
      setDays([day])
      return
    }
    setDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b),
    )
  }

  async function onShowUp() {
    try {
      await showUp()
      navigate('/day-complete')
    } catch {
      setSheet(null)
    }
  }

  async function onReplace(implementationId: string) {
    if (sheet?.kind !== 'replace') return
    try {
      await replace(sheet.commitment.id, implementationId)
      setSheet(null)
    } catch {
      return
    }
  }

  async function onSkip() {
    if (sheet?.kind !== 'skip') return
    try {
      await skip(sheet.commitment.id)
      setSheet(null)
    } catch {
      return
    }
  }

  async function onSaveDays() {
    if (!dayTarget?.planned_commitment_id || !canSaveDays) return
    try {
      if (dayTarget.recurrence === 'monthly') {
        await schedule(dayTarget.planned_commitment_id, { month_day: monthDay })
      } else {
        await schedule(dayTarget.planned_commitment_id, { weekdays: days })
      }
      setSheet(null)
    } catch {
      return
    }
  }

  const activities = (
    <div className={cn('flex flex-col gap-8 text-left', closed ? 'max-h-[60vh] overflow-y-auto' : 'mt-10')}>
      {record.today.groups
        .filter((group) => group.commitments.length > 0)
        .map((group) => (
          <section key={group.identity_id}>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">
              {group.identity_name.toUpperCase()}
            </p>
            {goalsOf(group.commitments).map((goal) => (
              <div key={goal.name} className="mt-4">
                <p
                  className={cn(
                    'text-[15px] font-extrabold',
                    closed && 'text-primary line-through decoration-primary/70',
                  )}
                >
                  {goal.name}
                </p>
                <ul className="mt-1">
                  {goal.items.map((commitment) => {
                    const settled = commitment.status !== 'open'
                    return (
                      <li
                        key={commitment.id}
                        className={cn(
                          'flex items-center gap-1 border-b border-white/8',
                          closed && 'border-white/5',
                        )}
                      >
                        <button
                          type="button"
                          disabled={closed || pending}
                          onClick={() => void toggle(commitment.id)}
                          className={cn(
                            'flex min-w-0 flex-1 items-center gap-4 py-4 text-left',
                            closed && 'cursor-default',
                          )}
                        >
                          <span
                            className={cn(
                              'size-7 shrink-0 rounded-full border-2 transition',
                              closed || settled ? 'border-primary bg-primary' : 'border-white/25',
                              closed && 'opacity-50',
                            )}
                          />
                          <span className="min-w-0">
                            <span className="block text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground">
                              {commitment.cadence.toUpperCase()}
                            </span>
                            <span
                              className={cn(
                                'text-[16px] font-semibold',
                                closed
                                  ? 'text-primary line-through decoration-primary/80'
                                  : commitment.status === 'skipped'
                                    ? 'text-white/35'
                                    : undefined,
                              )}
                            >
                              {commitment.implementation.title}
                            </span>
                          </span>
                        </button>
                        {closed ? null : (
                          <button
                            type="button"
                            aria-label={`Actions for ${commitment.implementation.title}`}
                            className="px-2 py-4 text-lg tracking-widest text-muted-foreground"
                            onClick={() => setSheet({ kind: 'menu', commitment })}
                          >
                            ···
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>
        ))}
    </div>
  )

  return (
    <Screen
      className={cn('max-w-lg!', closed ? 'flex-1 items-center justify-center text-center' : 'pb-40 md:pb-16')}
    >
      {moment ? (
        closed ? (
          <div className="flex max-w-sm flex-col items-center">
            <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-tight">
              Today, you are the person you want to become.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">Come back tomorrow.</p>
            <button
              type="button"
              className="mt-10 text-[15px] font-semibold text-primary"
              onClick={() => setShowDone(true)}
            >
              See today's activities
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-[42px] leading-none font-extrabold tracking-tight">Day {moment.day}</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {record.promises_kept}{' '}
              {record.promises_kept === 1
                ? 'day you kept a promise to yourself'
                : 'days you kept promises to yourself'}
            </p>
            <p className="mt-6 text-[18px] font-semibold">{record.statement}</p>
            <p className="mt-8 text-[22px] font-extrabold">{moment.phase}</p>
            <p className="mt-1 text-sm text-muted-foreground">About {moment.length} days</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-empty">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, (moment.day / moment.length) * 100)}%` }}
              />
            </div>
          </>
        )
      ) : null}

      {closed ? (
        <Sheet open={showDone} title="Today's activities" onClose={() => setShowDone(false)}>
          {activities}
        </Sheet>
      ) : (
        activities
      )}

      {record.today.coming_up.length > 0 && !closed ? (
        <section className="mt-10">
          <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Coming up</p>
          <ul className="mt-2">
            {record.today.coming_up.map((item) => (
              <li key={item.planned_commitment_id} className="border-b border-white/8">
                <button
                  type="button"
                  className="w-full py-3 text-left"
                  onClick={() => openDays(fromUpcoming(item))}
                >
                  <span className="block text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground">
                    {item.identity_name.toUpperCase()} · {item.cadence.toUpperCase()}
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.objective} · {item.when}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm font-semibold text-primary" role="alert">
          {error}
        </p>
      ) : null}

      {closed ? null : (
        <div className="fixed inset-x-0 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-30 px-6 md:static md:bottom-auto md:mt-10 md:px-0">
          <button
            type="button"
            disabled={!ready || pending}
            onClick={() => void onShowUp()}
            className={cn(
              'w-full max-w-md rounded-2xl px-5 py-4 text-base font-extrabold tracking-wide',
              ready
                ? 'bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(255,137,6,0.55)]'
                : 'bg-secondary text-muted-foreground',
            )}
          >
            I SHOWED UP
          </button>
        </div>
      )}

      <Sheet open={sheet?.kind === 'menu'} title="Today" onClose={() => setSheet(null)}>
        <SheetChoice
          label="Replace"
          onClick={() => sheet?.kind === 'menu' && setSheet({ kind: 'replace', commitment: sheet.commitment })}
        />
        <SheetChoice
          label="Skip this occurrence"
          onClick={() => sheet?.kind === 'menu' && setSheet({ kind: 'skip', commitment: sheet.commitment })}
        />
        {sheet?.kind === 'menu' && sheet.commitment.recurrence !== 'daily' ? (
          <SheetChoice label="Change days" onClick={() => openDays(fromCommitment(sheet.commitment))} />
        ) : null}
      </Sheet>
      <Sheet
        open={sheet?.kind === 'replace'}
        title="Choose how you want to complete it."
        lede="Goal stays the same."
        onClose={() => setSheet(null)}
      >
        {sheet?.kind === 'replace' ? (
          <>
            <p className="text-[15px] font-semibold">{sheet.commitment.objective}</p>
            <div className="mt-2">
              {sheet.commitment.implementations.map((item) => (
                <SheetChoice
                  key={item.id}
                  label={item.title}
                  selected={item.id === sheet.commitment.implementation.id}
                  onClick={() => void onReplace(item.id)}
                />
              ))}
            </div>
          </>
        ) : null}
      </Sheet>
      <Sheet open={sheet?.kind === 'skip'} title="Can't do this today? That's okay." onClose={() => setSheet(null)}>
        <SheetChoice
          label="Replace it"
          onClick={() => sheet?.kind === 'skip' && setSheet({ kind: 'replace', commitment: sheet.commitment })}
        />
        <SheetChoice label="Skip this occurrence" onClick={() => void onSkip()} />
      </Sheet>
      <Sheet
        open={sheet?.kind === 'days'}
        title="When should this happen?"
        lede={
          dayTarget?.recurrence === 'monthly'
            ? 'Choose the day of the month. Other days are not misses.'
            : `Select exactly ${needed} ${needed === 1 ? 'day' : 'days'}. Other days are not misses.`
        }
        onClose={() => setSheet(null)}
      >
        {dayTarget?.recurrence === 'monthly' ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setMonthDay(day)}
                className={cn(
                  'rounded-lg py-2 text-sm font-semibold',
                  monthDay === day ? 'bg-primary text-primary-foreground' : 'bg-white/5',
                )}
              >
                {day}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(index)}
                className={cn(
                  'rounded-lg py-2 text-sm font-semibold',
                  days.includes(index) ? 'bg-primary text-primary-foreground' : 'bg-white/5',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          disabled={!canSaveDays || pending}
          onClick={() => void onSaveDays()}
          className={cn(
            'mt-5 rounded-2xl px-5 py-3 text-sm font-extrabold',
            canSaveDays ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
          )}
        >
          Save days
        </button>
      </Sheet>
      <PremiumSoon />
    </Screen>
  )
}
