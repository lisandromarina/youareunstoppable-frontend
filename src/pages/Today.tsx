import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { cn } from 'cn'
import type { Commitment, Selection, Upcoming } from '../api/record'
import { Sheet, SheetChoice } from '../components/Sheet'
import { TomorrowList, tomorrowLabel } from '../components/TomorrowList'
import { PrimaryButton, Screen, WarmGlow } from '../components/look'
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

function handledLine(handled: number, total: number) {
  if (total === 0) return 'Nothing is due today.'
  const noun = total === 1 ? 'promise' : 'promises'
  return `${handled} of ${total} ${noun} handled. The rest can wait.`
}

function keptDaysLine(count: number) {
  const noun = count === 1 ? 'day' : 'days'
  return `${count} ${noun} you kept promises to yourself.`
}

function shortWhen(when: string) {
  return when
    .replaceAll('Monday', 'Mon')
    .replaceAll('Tuesday', 'Tue')
    .replaceAll('Wednesday', 'Wed')
    .replaceAll('Thursday', 'Thu')
    .replaceAll('Friday', 'Fri')
    .replaceAll('Saturday', 'Sat')
    .replaceAll('Sunday', 'Sun')
    .replaceAll(', ', ' · ')
}

function writtenDay(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const monthName = date.toLocaleDateString('en-US', { month: 'short' })
  return `${weekday}, ${monthName} ${date.getDate()}`
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
  const showedUp = useRecord((state) => state.showedUp)
  const [sheet, setSheet] = useState<SheetState>(null)
  const [days, setDays] = useState<number[]>([])
  const [monthDay, setMonthDay] = useState(1)
  const [lit, setLit] = useState<string | null>(null)

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record) return null

  const commitments = record.today.groups.flatMap((group) => group.commitments)
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

  async function onToggle(id: string) {
    const before = commitments.find((item) => item.id === id)
    await toggle(id)
    const after = useRecord
      .getState()
      .record?.today.groups.flatMap((group) => group.commitments)
      .find((item) => item.id === id)
    if (before?.status === 'open' && after?.status === 'done') {
      setLit(null)
      requestAnimationFrame(() => setLit(id))
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

  async function onShowedUp() {
    try {
      await showedUp()
      navigate('/day-complete')
    } catch {
      return
    }
  }

  const handled = commitments.filter((item) => item.status !== 'open').length
  const left = commitments.length - handled
  const ready = left === 0
  const columns = record.selections
    .map((selection) => ({
      selection,
      commitments: record.today.groups.find((group) => group.identity_id === selection.identity_id)?.commitments ?? [],
      upcoming: (record.today.coming_up ?? []).filter((item) => item.identity_name === selection.identity_name),
    }))
    .filter((column) => column.commitments.length > 0 || column.upcoming.length > 0)

  return (
    <Screen
      className={cn(
        'max-w-lg! lg:max-w-6xl! lg:px-10 lg:pt-10 lg:pb-12',
        closed ? 'pb-28' : 'pb-56',
      )}
    >
      <div className="mx-auto w-full max-w-lg">
        <p className="text-[12px] font-extrabold tracking-[0.18em] text-primary">
          {writtenDay(record.today.date).toUpperCase()}
        </p>
        {closed ? (
          <ClosedDay recordDate={record.today.date} promisesKept={record.promises_kept} columns={columns} tomorrow={record.tomorrow} />
        ) : (
          <>
            <div className="mt-6 size-16 rounded-lg border-2 border-dashed border-white/25" aria-hidden />
            <h1 className="mt-6 text-[3.15rem] leading-none font-extrabold tracking-tight">One day is yours.</h1>
            <p className="mt-4 text-[17px] text-foreground/75">{handledLine(handled, commitments.length)}</p>
            <div className="mt-10 flex flex-col gap-10">
              {columns.map((column) => (
                <IdentityColumn
                  key={column.selection.identity_id}
                  selection={column.selection}
                  commitments={column.commitments}
                  upcoming={column.upcoming}
                  pending={pending}
                  lit={lit}
                  onToggle={(id) => void onToggle(id)}
                  onMenu={(commitment) => setSheet({ kind: 'menu', commitment })}
                  onDays={openDays}
                />
              ))}
            </div>
            {error ? (
              <p className="mt-4 text-sm font-semibold text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-white/8 bg-background/95 px-6 py-3 backdrop-blur-xl lg:static lg:inset-auto lg:z-auto lg:mt-10 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
              {ready ? (
                <PrimaryButton
                  className="uppercase tracking-[0.16em] lg:max-w-none"
                  type="button"
                  disabled={pending}
                  onClick={() => void onShowedUp()}
                >
                  I showed up
                </PrimaryButton>
              ) : (
                <button
                  type="button"
                  disabled
                  className="h-auto w-full rounded-2xl bg-white/8 px-5 py-4 text-[13px] font-extrabold tracking-[0.16em] text-white/40 uppercase"
                >
                  I showed up
                </button>
              )}
              {left > 0 ? (
                <p className="mt-3 text-center text-[13px] text-muted-foreground">
                  {left} left. Keep or skip each promise due today to close the day.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

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
    </Screen>
  )
}

function PromiseRow({
  commitment,
  pending,
  lit,
  onToggle,
  onMenu,
}: {
  commitment: Commitment
  pending: boolean
  lit: boolean
  onToggle: () => void
  onMenu: () => void
}) {
  const done = commitment.status === 'done'
  const skipped = commitment.status === 'skipped'
  return (
    <div className={cn('flex items-center gap-3 px-4 py-4', lit && 'row-glow')}>
      <button
        type="button"
        disabled={pending}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            done ? 'bg-primary text-primary-foreground' : 'border-2 border-white/30 text-white/40',
            lit && 'check-in',
          )}
        >
          {done ? <CheckIcon /> : skipped ? <DashIcon /> : null}
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              'block text-[11px] font-extrabold tracking-[0.14em]',
              done ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {commitment.cadence.toUpperCase()}
            {done ? ' · KEPT' : skipped ? ' · SKIPPED TODAY' : ''}
          </span>
          <span className={cn('mt-1 block text-[18px] leading-snug font-extrabold', skipped && 'text-white/40')}>
            {commitment.implementation.title}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={`Actions for ${commitment.implementation.title}`}
        className="px-2 text-lg tracking-widest text-muted-foreground"
        onClick={onMenu}
      >
        ...
      </button>
    </div>
  )
}

function IdentityColumn({
  selection,
  commitments,
  upcoming,
  pending,
  lit,
  onToggle,
  onMenu,
  onDays,
}: {
  selection: Selection
  commitments: Commitment[]
  upcoming: Upcoming[]
  pending: boolean
  lit: string | null
  onToggle: (id: string) => void
  onMenu: (commitment: Commitment) => void
  onDays: (target: Schedulable) => void
}) {
  const moment = phaseMoment(selection, false)
  const kept = commitments.filter((item) => item.status === 'done').length
  const width = moment.length === 0 ? 0 : Math.min(100, (moment.filled / moment.length) * 100)

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-extrabold tracking-[0.14em] text-primary">
          {selection.identity_name.toUpperCase()}
        </h2>
        {commitments.length > 0 ? (
          <p className="text-[13px] text-muted-foreground">
            {kept} of {commitments.length} kept
          </p>
        ) : null}
      </div>
      <p className="mt-2 text-[14px] text-muted-foreground">
        {selection.direction_name} · {selection.stage_name} · Day {moment.day}
      </p>
      <div className="mt-3 h-px bg-white/10">
        <div className="h-0.5 rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
      {commitments.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-white/10 bg-card">
          {commitments.map((commitment, index) => (
            <div key={commitment.id} className={cn(index > 0 && 'border-t border-white/8')}>
              <PromiseRow
                commitment={commitment}
                pending={pending}
                lit={lit === commitment.id}
                onToggle={() => onToggle(commitment.id)}
                onMenu={() => onMenu(commitment)}
              />
            </div>
          ))}
        </div>
      ) : null}
      {upcoming.length > 0 ? (
        <div className="mt-5">
          <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">COMING UP</p>
          <ul className="mt-2">
            {upcoming.map((item) => (
              <li key={item.planned_commitment_id} className="border-b border-white/8 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[16px] font-semibold">{item.title}</span>
                  <button
                    type="button"
                    className="shrink-0 text-[14px] text-foreground/80 underline decoration-white/30 underline-offset-4"
                    onClick={() => onDays(fromUpcoming(item))}
                  >
                    Change days
                  </button>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {item.cadence}
                  {item.when ? ` · ${shortWhen(item.when)}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function ClosedDay({
  recordDate,
  promisesKept,
  columns,
  tomorrow,
}: {
  recordDate: string
  promisesKept: number
  columns: { selection: Selection; commitments: Commitment[] }[]
  tomorrow: Parameters<typeof TomorrowList>[0]['items']
}) {
  return (
    <>
      <WarmGlow className="mt-6">
        <div className="size-16 rounded-lg bg-primary" aria-hidden />
      </WarmGlow>
      <h1 className="mt-6 text-[3.15rem] leading-none font-extrabold tracking-tight">You showed up.</h1>
      <p className="mt-4 text-[17px] text-foreground/70">{keptDaysLine(promisesKept)}</p>
      <p className="mt-10 text-[11px] font-extrabold tracking-[0.16em] text-muted-foreground">TODAY</p>
      {columns
        .filter((column) => column.commitments.length > 0)
        .map((column) => {
          const kept = column.commitments.filter((item) => item.status === 'done').length
          return (
            <section key={column.selection.identity_id} className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[13px] font-extrabold tracking-[0.14em] text-primary">
                  {column.selection.identity_name.toUpperCase()}
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  {kept} of {column.commitments.length} kept
                </p>
              </div>
              <ul className="mt-1">
                {column.commitments.map((commitment) => {
                  const done = commitment.status === 'done'
                  const skipped = commitment.status === 'skipped'
                  return (
                    <li key={commitment.id} className="flex items-center gap-3 border-b border-white/8 py-3">
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full',
                          done ? 'bg-primary text-primary-foreground' : 'border border-white/25 text-white/40',
                        )}
                      >
                        {done ? <CheckIcon /> : skipped ? <DashIcon /> : null}
                      </span>
                      <span className={cn('min-w-0 flex-1 text-[16px] font-semibold', skipped && 'text-white/40')}>
                        {commitment.implementation.title}
                      </span>
                      <span className="shrink-0 text-[13px] text-muted-foreground">
                        {skipped ? 'Skipped' : commitment.cadence}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      <TomorrowList items={tomorrow} heading={tomorrowLabel(recordDate)} />
      <p className="mt-8 text-[15px] text-muted-foreground">Nothing left for today. Rest.</p>
    </>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path
        d="M3.2 8.3 6.3 11.2 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
