import { useState } from 'react'
import { Navigate } from 'react-router'

import { cn } from 'cn'
import type { Commitment, Selection, YearDay } from '../api/record'
import { Screen } from '../components/look'
import { phaseMoment, useRecord } from '../data/record'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type Mark = 'showed' | 'today' | 'ahead' | 'before'

export function Progress() {
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)
  const pending = useRecord((state) => state.pending)
  const toggle = useRecord((state) => state.toggle)
  const [yearOpen, setYearOpen] = useState(false)
  const [identityId, setIdentityId] = useState<string | null>(null)

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record) return null

  const selected = record.selections.find((item) => item.identity_id === identityId) ?? record.selections[0]
  const moment = selected ? phaseMoment(selected, record.today.closed) : null
  const commitments =
    record.today.groups.find((group) => group.identity_id === selected?.identity_id)?.commitments ?? []
  const kept = commitments.filter((item) => item.status === 'done').length
  const showed = selected ? record.year.filter((day) => identityShowed(day, selected.identity_id)).length : 0
  const run = selected ? longestRun(record.year, selected.identity_id) : 0
  const today = record.year.find((day) => day.today)?.date ?? record.today.date
  const byDate = new Map(record.year.map((day) => [day.date, day]))
  const length = moment?.length ?? selected?.length_days ?? 14
  const windowStart = record.started_on
  const windowEnd = addDays(windowStart, Math.max(0, length - 1))
  const shown = moment?.filled ?? 0
  const width = length === 0 ? 0 : Math.min(100, (shown / length) * 100)
  const monthDate = parseISO(today)
  const identity = selected?.identity_id ?? ''

  function openYear() {
    setYearOpen(true)
    window.scrollTo(0, 0)
  }

  return (
    <Screen className="max-w-lg! pb-28 lg:max-w-6xl! lg:px-10 lg:pt-10 lg:pb-12">
      <div className={cn(yearOpen && 'max-lg:hidden')}>
        {record.selections.length > 1 ? (
          <div className="mb-6 flex lg:mb-8 lg:justify-center">
            <div className="flex w-full rounded-full bg-card p-1 lg:w-auto">
              {record.selections.map((selection) => {
                const active = selection.identity_id === selected?.identity_id
                return (
                  <button
                    key={selection.identity_id}
                    type="button"
                    onClick={() => setIdentityId(selection.identity_id)}
                    className={cn(
                      'flex-1 rounded-full px-5 py-2.5 text-[15px] font-semibold lg:flex-none lg:px-6 lg:py-2',
                      active ? 'bg-primary text-[#1a1200]' : 'text-foreground/80',
                    )}
                  >
                    {selection.identity_name}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8 xl:gap-12">
          <div>
            <p className="text-[12px] font-extrabold tracking-[0.16em] text-primary">
              {selected?.identity_name.toUpperCase()}
            </p>
            <p className="mt-3 text-[5.5rem] leading-none font-extrabold tracking-tight">{showed}</p>
            <p className="mt-2 text-[1.65rem] leading-tight font-semibold">
              {showed === 1 ? 'day you showed up' : 'days you showed up'}
            </p>
            <p className="mt-2 hidden text-[14px] text-muted-foreground lg:block">
              Longest run: {run} {dayWord(run)}
            </p>
          </div>
          <PhaseCard
            selection={selected}
            day={moment?.day ?? record.progress.day_in_phase}
            length={length}
            width={width}
            shown={shown}
            kept={kept}
            total={commitments.length}
            commitments={commitments}
            closed={record.today.closed}
            pending={pending}
            onToggle={(id) => void toggle(id)}
          />
        </div>

        <button
          type="button"
          onClick={openYear}
          className="mt-4 w-full rounded-[1.35rem] border border-white/8 bg-card p-5 text-left lg:hidden"
        >
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[20px] font-extrabold">Your first {length} days</span>
            <span className="text-[13px] text-muted-foreground">{sameMonthRange(windowStart, windowEnd)}</span>
          </span>
          <Weekdays className="mt-4" />
          <Fortnight
            start={windowStart}
            end={windowEnd}
            byDate={byDate}
            started={record.started_on}
            identityId={identity}
          />
          <Legend compact className="mt-4" />
        </button>

        <div className="mt-8 hidden flex-col gap-4 lg:flex">
          <YearCard
            year={monthDate.getFullYear()}
            today={today}
            showed={showed}
            byDate={byDate}
            started={record.started_on}
            identityId={identity}
            columns={4}
          />
        </div>
      </div>

      {yearOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setYearOpen(false)}
            className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary"
          >
            <BackChevron />
            Progress
          </button>
          <h1 className="mt-4 text-[3.4rem] leading-none font-extrabold tracking-tight">{monthDate.getFullYear()}</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {showed} {dayWord(showed)} showed up · Longest run: {run} {dayWord(run)}
          </p>
          <div className="mt-5">
            <YearCard
              year={monthDate.getFullYear()}
              today={today}
              showed={showed}
              byDate={byDate}
              started={record.started_on}
              identityId={identity}
              columns={3}
              hideCount
            />
          </div>
        </div>
      ) : null}
    </Screen>
  )
}

function PhaseCard({
  selection,
  day,
  length,
  width,
  shown,
  kept,
  total,
  commitments,
  closed,
  pending,
  onToggle,
}: {
  selection: Selection | undefined
  day: number
  length: number
  width: number
  shown: number
  kept: number
  total: number
  commitments: Commitment[]
  closed: boolean
  pending: boolean
  onToggle: (id: string) => void
}) {
  return (
    <section className="mt-6 rounded-[1.35rem] border border-white/8 bg-card p-5 lg:mt-7">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[20px] font-extrabold">{selection?.stage_name ?? 'Progress'}</h2>
        <p className="text-[13px] text-muted-foreground">
          Day {day} of about {length}
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-empty">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">
        {shown} of {length} shown-up days to move on
      </p>
      {total > 0 ? (
        <div className="mt-4 border-t border-white/8 pt-4">
          <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">
            TODAY · {kept} OF {total} KEPT
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {commitments.map((commitment) => {
              const done = commitment.status === 'done'
              return (
                <li key={commitment.id}>
                  <button
                    type="button"
                    disabled={closed || pending}
                    onClick={() => onToggle(commitment.id)}
                    className="flex w-full items-center gap-3 text-left disabled:cursor-default"
                  >
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                        done ? 'border-primary bg-primary text-white' : 'border-white/25',
                      )}
                    >
                      {done ? <CheckIcon /> : null}
                    </span>
                    <span className={cn('text-[16px] font-semibold', commitment.status === 'skipped' && 'text-white/35')}>
                      {commitment.implementation.title}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function YearCard({
  year,
  today,
  showed,
  byDate,
  started,
  identityId,
  columns,
  hideCount = false,
}: {
  year: number
  today: string
  showed: number
  byDate: Map<string, YearDay>
  started: string
  identityId: string
  columns: 3 | 4
  hideCount?: boolean
}) {
  return (
    <section className="rounded-[1.35rem] border border-white/8 bg-card p-5">
      {hideCount ? null : (
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="text-[28px] font-extrabold">{year}</h2>
          <p className="text-[13px] text-muted-foreground">
            {showed} {dayWord(showed)} showed up
          </p>
        </div>
      )}
      <div className={cn('grid gap-x-4 gap-y-6', columns === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
        {MONTHS.map((name, month) => {
          const cells = monthCells(year, month)
          const current = cells.some((iso) => iso === today)
          return (
            <div key={name}>
              <p className={cn('text-[13px] font-semibold', current ? 'text-primary' : 'text-muted-foreground')}>{name}</p>
              <div className="mt-2 grid grid-cols-7 gap-[3px]">
                {cells.map((iso, index) =>
                  iso ? (
                    <span
                      key={iso}
                      className={cn('aspect-square rounded-[2px]', miniClass(markFor(iso, byDate, started, identityId)))}
                    />
                  ) : (
                    <span key={`${name}-pad-${index}`} />
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>
      <Legend className="mt-5" />
    </section>
  )
}

function Fortnight({
  start,
  end,
  byDate,
  started,
  identityId,
}: {
  start: string
  end: string
  byDate: Map<string, YearDay>
  started: string
  identityId: string
}) {
  const lead = parseISO(start).getDay()
  const last = parseISO(end).getDay()
  const tail = (6 - last + 7) % 7
  const cells: Array<string | null> = [
    ...Array.from({ length: lead }, () => null),
    ...datesBetween(start, end),
    ...Array.from({ length: tail }, () => null),
  ]
  return (
    <div className="mt-2 grid grid-cols-7 gap-2">
      {cells.map((iso, index) =>
        iso ? (
          <span
            key={iso}
            className={cn(
              'flex aspect-square items-center justify-center rounded-xl text-[14px] font-bold',
              dayClass(markFor(iso, byDate, started, identityId)),
            )}
          >
            {parseISO(iso).getDate()}
          </span>
        ) : (
          <span key={`empty-${index}`} />
        ),
      )}
    </div>
  )
}

function Weekdays({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground', className)}>
      {WEEKDAYS.map((day, index) => (
        <span key={`${day}-${index}`}>{day}</span>
      ))}
    </div>
  )
}

function Legend({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground', className)}>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-primary" />
        Showed up
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] border border-primary" />
        Today
      </span>
      {compact ? null : (
        <>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-empty" />
            Ahead
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-black/40" />
            Before you started
          </span>
        </>
      )}
    </div>
  )
}

function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <path
        d="M10 3.5 5.5 8 10 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function miniClass(mark: Mark) {
  if (mark === 'showed') return 'bg-primary'
  if (mark === 'today') return 'ring-1 ring-primary ring-inset'
  if (mark === 'before') return 'bg-black/40'
  return 'bg-empty'
}

function dayClass(mark: Mark) {
  if (mark === 'showed') return 'bg-primary text-white'
  if (mark === 'today') return 'border-2 border-primary text-foreground'
  if (mark === 'before') return 'bg-black/40 text-white/30'
  return 'bg-empty text-white/80'
}

function identityShowed(day: YearDay, identityId: string) {
  if (!day.closed) return false
  const own = day.identities.find((item) => item.identity_id === identityId)
  if (!own) return day.identities.length === 0
  return own.intensity > 0
}

function markFor(iso: string, byDate: Map<string, YearDay>, started: string, identityId: string): Mark {
  const day = byDate.get(iso)
  if (day) {
    if (day.date < started) return 'before'
    if (identityShowed(day, identityId)) return 'showed'
    if (day.today) return 'today'
    return day.date > started ? 'ahead' : 'before'
  }
  if (iso < started) return 'before'
  return 'ahead'
}

function longestRun(days: YearDay[], identityId: string) {
  let best = 0
  let run = 0
  for (const day of days) {
    if (identityShowed(day, identityId)) {
      run += 1
      if (run > best) best = run
    } else {
      run = 0
    }
  }
  return best
}

function dayWord(count: number) {
  return count === 1 ? 'day' : 'days'
}

function parseISO(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function toISO(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(iso: string, count: number) {
  const date = parseISO(iso)
  date.setDate(date.getDate() + count)
  return toISO(date)
}

function datesBetween(start: string, end: string) {
  const days: string[] = []
  let cursor = start
  while (cursor <= end) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return days
}

function sameMonthRange(start: string, end: string) {
  const a = parseISO(start)
  const b = parseISO(end)
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${MONTHS[a.getMonth()]} ${a.getDate()}–${b.getDate()}`
  }
  return `${MONTHS[a.getMonth()]} ${a.getDate()}–${MONTHS[b.getMonth()]} ${b.getDate()}`
}

function monthCells(year: number, month: number) {
  const lead = new Date(year, month, 1).getDay()
  const count = new Date(year, month + 1, 0).getDate()
  const cells: Array<string | null> = Array.from({ length: lead }, () => null)
  for (let day = 1; day <= count; day += 1) cells.push(toISO(new Date(year, month, day)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
