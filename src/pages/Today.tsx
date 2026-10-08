import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { cn } from 'cn'
import type { Commitment, Selection, Upcoming } from '../api/record'
import { identityTint } from '../components/tints'
import { Sheet, SheetChoice } from '../components/Sheet'
import { TomorrowList } from '../components/TomorrowList'
import { Screen } from '../components/look'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { phaseMoment, useRecord } from '../data/record'
import { coachEntitled } from '../session/access'
import { useSession } from '../session/store'

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

function desktopLede(kept: number, total: number, closed: boolean) {
  if (closed) return 'You showed up today.'
  if (total === 0) return 'Nothing is due today.'
  if (kept >= total) return total === 1 ? 'You kept today’s promise.' : 'You kept today’s promises.'
  const noun = total === 1 ? 'promise' : 'promises'
  return `${kept} of ${total} ${noun} kept. The rest can wait.`
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
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)
  const pending = useRecord((state) => state.pending)
  const error = useRecord((state) => state.error)
  const toggle = useRecord((state) => state.toggle)
  const replace = useRecord((state) => state.replace)
  const skip = useRecord((state) => state.skip)
  const schedule = useRecord((state) => state.schedule)
  const [sheet, setSheet] = useState<SheetState>(null)
  const [days, setDays] = useState<number[]>([])
  const [monthDay, setMonthDay] = useState(1)
  const [lit, setLit] = useState<string | null>(null)
  const user = useSession((state) => state.user)
  const entitled = coachEntitled(user)
  const [upgrade, setUpgrade] = useState(false)

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

  const kept = commitments.filter((item) => item.status === 'done').length
  const columns = record.selections
    .map((selection) => ({
      selection,
      commitments: record.today.groups.find((group) => group.identity_id === selection.identity_id)?.commitments ?? [],
    }))
    .filter((column) => column.commitments.length > 0)

  return (
    <Screen className="max-w-lg! pb-28 lg:max-w-6xl! lg:px-10 lg:pt-10 lg:pb-12">
      <p className="text-[15px] font-semibold text-primary">{writtenDay(record.today.date)}</p>
      <h1 className="mt-2 text-[3.15rem] leading-none font-extrabold tracking-tight lg:text-[3.35rem]">
        One day is yours.
      </h1>
      <p className="mt-3 max-w-sm text-[18px] text-foreground/80">{desktopLede(kept, commitments.length, closed)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-x-10">
        {columns.map((column) => (
          <IdentityColumn
            key={column.selection.identity_id}
            selection={column.selection}
            commitments={column.commitments}
            closed={closed}
            pending={pending}
            lit={lit}
            onToggle={(id) => void onToggle(id)}
            onMenu={(commitment) => setSheet({ kind: 'menu', commitment })}
          />
        ))}
      </div>

      <p className="mt-8 max-w-xl text-[14px] text-muted-foreground">
        {record.selections.length > 1
          ? 'Each identity counts on its own. Keep one promise under it and that day is yours.'
          : 'Keep one promise and the day is yours.'}
      </p>
      {entitled ? <ProCoach /> : <LockedCoach onUnlock={() => setUpgrade(true)} />}

      {record.today.coming_up?.length > 0 && !closed ? (
            <section className="mt-8">
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">COMING UP</p>
              <ul className="mt-2">
                {record.today.coming_up.map((item) => (
                  <li key={item.planned_commitment_id} className="border-b border-white/8">
                    <button type="button" className="w-full py-3 text-left" onClick={() => openDays(fromUpcoming(item))}>
                      <span className="block text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground">
                        <span
                          style={{
                            color: identityTint(
                              record.selections.find((selection) => selection.identity_name === item.identity_name)
                                ?.identity_id ?? '',
                            ),
                          }}
                        >
                          {item.identity_name.toUpperCase()}
                        </span>
                        {' · '}
                        {item.cadence.toUpperCase()}
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
            <p className="mt-4 text-sm font-semibold text-destructive" role="alert">
              {error}
            </p>
          ) : null}

      <TomorrowList
        items={record.tomorrow}
        showIdentity={record.selections.length > 1}
        cards
        aside={closed ? undefined : 'If you show up today'}
      />
      {upgrade ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <UpgradePrompt onClose={() => setUpgrade(false)} />
        </div>
      ) : null}

      <Sheet open={sheet?.kind === 'menu'} title="Today" onClose={() => setSheet(null)}>
        <SheetChoice
          label="Replace"
          onClick={() => sheet?.kind === 'menu' && setSheet({ kind: 'replace', commitment: sheet.commitment })}
        />
        <SheetChoice
          label="Skip this occurrence"
          onClick={() => sheet?.kind === 'menu' && setSheet({ kind: 'skip', commitment: sheet.commitment })}
        />
        {sheet?.kind === 'menu' &&
        sheet.commitment.recurrence !== 'daily' &&
        sheet.commitment.recurrence !== 'once' ? (
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

function ProCoach() {
  return (
    <section className="mt-6 max-w-2xl rounded-[1.35rem] border border-white/10 bg-card p-5">
      <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.16em]">
        YOUR COACH
        <ProMark />
      </p>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/80">
        Tell me what you can already do and what you want to work on. I’ll size each day to how you’re showing up.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/coach"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-extrabold text-primary-foreground"
        >
          Talk with your coach →
        </Link>
        <Link
          to="/coach?adjust=1"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-[15px] font-semibold sm:px-5"
        >
          Adjust today
        </Link>
      </div>
    </section>
  )
}

function LockedCoach({ onUnlock }: { onUnlock: () => void }) {
  return (
    <section className="mt-6 max-w-2xl rounded-[1.35rem] border border-dashed border-white/15 bg-card/70 p-5">
      <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.16em] text-foreground/80">
        <LockIcon />
        YOUR COACH
        <ProMark />
      </p>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/75">
        A coach that sizes each day to how you’re showing up. Small when you’re starting, fuller as your streak grows.
      </p>
      <button
        type="button"
        onClick={onUnlock}
        className="mt-4 w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-extrabold text-primary-foreground sm:w-auto sm:px-8"
      >
        Unlock with Pro →
      </button>
    </section>
  )
}

function ProMark() {
  return (
    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-primary-foreground">
      PRO
    </span>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 text-foreground/70" aria-hidden>
      <rect x="3.2" y="7" width="9.6" height="6.5" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function PromiseRow({
  commitment,
  closed,
  pending,
  lit,
  onToggle,
  onMenu,
}: {
  commitment: Commitment
  closed: boolean
  pending: boolean
  lit: boolean
  onToggle: () => void
  onMenu: () => void
}) {
  const done = commitment.status === 'done'
  const skipped = commitment.status === 'skipped'
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-[1.25rem] border-2 bg-card px-4 py-4',
        done ? 'border-primary' : 'border-white/10',
        lit && 'row-glow',
      )}
    >
      <button
        type="button"
        disabled={closed || pending}
        onClick={onToggle}
        className={cn('flex min-w-0 flex-1 items-center gap-3 text-left', closed && 'cursor-default')}
      >
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full border-2',
            done ? 'border-primary bg-primary text-primary-foreground' : 'border-white/30',
            lit && 'check-in',
          )}
        >
          {done ? <CheckIcon /> : null}
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              'block text-[11px] font-extrabold tracking-[0.14em]',
              done ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {commitment.recurrence === 'once' && commitment.due_on
              ? `ONCE · ${commitment.due_on}`
              : commitment.cadence.toUpperCase()}
            {done ? ' · KEPT' : skipped ? ' · SKIPPED' : ''}
          </span>
          <span className={cn('mt-1 block text-[18px] leading-snug font-extrabold', skipped && 'text-white/35')}>
            {commitment.implementation.title}
          </span>
          {commitment.reason ? (
            <span className="mt-1 block text-sm font-normal leading-relaxed text-muted-foreground">
              {commitment.reason}
            </span>
          ) : null}
        </span>
      </button>
      {closed ? null : (
        <button
          type="button"
          aria-label={`Actions for ${commitment.implementation.title}`}
          className="px-2 text-lg tracking-widest text-muted-foreground"
          onClick={onMenu}
        >
          ...
        </button>
      )}
    </div>
  )
}

function IdentityColumn({
  selection,
  commitments,
  closed,
  pending,
  lit,
  onToggle,
  onMenu,
}: {
  selection: Selection
  commitments: Commitment[]
  closed: boolean
  pending: boolean
  lit: string | null
  onToggle: (id: string) => void
  onMenu: (commitment: Commitment) => void
}) {
  const moment = phaseMoment(selection, closed)
  const kept = commitments.filter((item) => item.status === 'done').length
  const width = moment.length === 0 ? 0 : Math.min(100, (moment.filled / moment.length) * 100)

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-extrabold tracking-[0.14em] text-primary">
          {selection.identity_name.toUpperCase()}
        </h2>
        <p className="text-[13px] text-muted-foreground">
          {kept} of {commitments.length} kept
        </p>
      </div>
      <p className="mt-2 text-[15px] text-foreground/85">
        {selection.direction_name} · {selection.stage_name} · Day {moment.day}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-empty">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">
        {moment.filled} of {moment.length} shown-up days to move on
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {commitments.map((commitment) => (
          <PromiseRow
            key={commitment.id}
            commitment={commitment}
            closed={closed}
            pending={pending}
            lit={lit === commitment.id}
            onToggle={() => onToggle(commitment.id)}
            onMenu={() => onMenu(commitment)}
          />
        ))}
      </div>
    </section>
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
