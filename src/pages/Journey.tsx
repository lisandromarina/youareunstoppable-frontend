import { useState } from 'react'
import { Navigate } from 'react-router'

import { cn } from 'cn'
import type { Catalog, CatalogPhase, Phase, Selection } from '../api/record'
import { Screen } from '../components/look'
import { phaseMoment, useRecord } from '../data/record'

export function Journey() {
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)
  const catalog = useRecord((state) => state.catalog)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [identityId, setIdentityId] = useState<string | null>(null)

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record) return null

  const selected = record.selections.find((item) => item.identity_id === identityId) ?? record.selections[0]
  const moment = selected ? phaseMoment(selected, record.today.closed) : null
  const found = selected ? selected.phases.findIndex((phase) => phase.status === 'current') : -1
  const currentIndex = !selected ? 0 : found >= 0 ? found : Math.max(0, selected.phases.length - 1)
  const stage = selected?.phases[currentIndex]

  return (
    <Screen className="max-w-lg! pb-28 lg:max-w-6xl! lg:px-10 lg:pt-10 lg:pb-12">
      {record.selections.length > 1 ? (
        <div className="mb-6 flex lg:mb-8 lg:justify-center">
          <div className="flex w-full rounded-full bg-card p-1 lg:w-auto">
            {record.selections.map((selection) => {
              const active = selection.identity_id === selected?.identity_id
              return (
                <button
                  key={selection.identity_id}
                  type="button"
                  onClick={() => {
                    setIdentityId(selection.identity_id)
                    setOpenKey(null)
                  }}
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

      {selected ? (
        <>
          <PathEyebrow name={selected.identity_name} />
          <h1 className="mt-3 max-w-4xl text-[2.35rem] leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
            {record.selections.length > 1 ? pathStatement(selected.identity_name) : record.statement}
          </h1>
          <p className="mt-3 text-[17px] text-foreground/70">{selected.direction_name}</p>
          <div className="mt-6 lg:mt-8">
            <SummaryCard
              phaseNumber={currentIndex + 1}
              stage={stage?.name ?? selected.stage_name}
              day={moment?.day ?? selected.day_in_phase}
              length={moment?.length ?? selected.length_days}
              shown={moment?.filled ?? 0}
              closed={record.today.closed}
            />
            <div
              className={cn(
                'mt-4 grid gap-3',
                selected.phases.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
                selected.phases.length <= 2 && 'lg:grid-cols-2',
              )}
            >
              {selected.phases.map((phase, index) => {
                const key = `${selected.identity_id}:${phase.name}`
                const current = phase.status === 'current'
                const open = openKey === null ? current : openKey === key
                const source = catalogPhase(catalog, selected, phase.name)
                return (
                  <PhaseCard
                    key={phase.name}
                    phase={phase}
                    index={index}
                    phases={selected.phases}
                    open={open}
                    ask={askText(source, phase.headline)}
                    why={whyText(source, phase.headline)}
                    onToggle={() => setOpenKey(open ? '' : key)}
                  />
                )
              })}
            </div>
          </div>
        </>
      ) : null}

      <p className="mt-8 text-center text-[13px] leading-relaxed text-muted-foreground lg:mt-10">
        Want a path tuned to your goals and pace? Premium is coming soon.
      </p>
    </Screen>
  )
}

function pathStatement(name: string) {
  return `I’m becoming ${name.toLowerCase()}.`
}

function PathEyebrow({ name, className }: { name: string; className?: string }) {
  return (
    <p className={cn('text-[12px] font-extrabold tracking-[0.16em] text-primary', className)}>
      {name.toUpperCase()} PATH
    </p>
  )
}

function SummaryCard({
  phaseNumber,
  stage,
  day,
  length,
  shown,
  closed,
}: {
  phaseNumber: number
  stage: string
  day: number
  length: number
  shown: number
  closed: boolean
}) {
  const width = length === 0 ? 0 : Math.min(100, (shown / length) * 100)
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-card p-5">
      <div className="lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div className="flex items-start justify-between gap-4 lg:block">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-muted-foreground">
              PHASE {phaseNumber} · {stage.toUpperCase()}
            </p>
            <p className="mt-2 text-[2.75rem] leading-none font-extrabold tracking-tight">Day {day}</p>
            <p className="mt-2 hidden text-[13px] text-muted-foreground lg:block">about {length} days</p>
          </div>
          <p className="pt-0.5 text-[13px] text-muted-foreground lg:hidden">about {length} days</p>
        </div>
        <div className="mt-4 lg:mt-0 lg:w-fit lg:max-w-[68%]">
          <Dots length={length} shown={shown} closed={closed} />
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-empty">
            <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {shown} of {length} shown-up days to move on
          </p>
        </div>
      </div>
    </div>
  )
}

function Dots({ length, shown, closed }: { length: number; shown: number; closed: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:gap-2.5" aria-hidden>
      {Array.from({ length }, (_, index) => {
        const done = index < shown
        const current = !closed && index === shown && index < length
        return (
          <span
            key={index}
            className={cn(
              'size-7 rounded-[6px] sm:size-8',
              done && 'bg-primary',
              current && 'border-2 border-primary',
              !done && !current && 'bg-empty',
            )}
          />
        )
      })}
    </div>
  )
}

function PhaseCard({
  phase,
  index,
  phases,
  open,
  ask,
  why,
  onToggle,
}: {
  phase: Phase
  index: number
  phases: Phase[]
  open: boolean
  ask: string
  why: string
  onToggle: () => void
}) {
  const current = phase.status === 'current'
  return (
    <article
      className={cn(
        'rounded-[1.35rem] border bg-card p-5',
        current ? 'border-primary' : 'border-white/8',
      )}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left lg:pointer-events-none"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold',
              current ? 'bg-primary text-[#1a1200]' : 'bg-white/10 text-muted-foreground',
            )}
          >
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className={cn('block text-[20px] leading-none font-extrabold', current && 'text-primary')}>
              {phase.name}
            </span>
            <span className="mt-1.5 block text-[13px] text-muted-foreground">{phaseSubtitle(phase, index, phases)}</span>
          </span>
        </span>
        <Chevron className={cn('mt-1 lg:hidden', open && 'rotate-180')} />
      </button>
      <div className={cn('mt-5', !open && 'hidden', 'lg:mt-5 lg:block')}>
        <PhaseCopy label="The ask" body={ask} />
        <PhaseCopy label="Why this first" body={why} />
        <PhaseCopy label="You move on when" body={`You've shown up ${phase.length_days} of ${phase.length_days} days.`} />
      </div>
    </article>
  )
}

function PhaseCopy({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="text-[11px] font-extrabold tracking-[0.14em] text-primary uppercase">{label}</p>
      <p className="mt-1.5 text-[15px] leading-snug font-semibold">{body}</p>
    </div>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-4 shrink-0 text-muted-foreground', className)} aria-hidden>
      <path
        d="M3.5 6 8 10.5 12.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function phaseSubtitle(phase: Phase, index: number, phases: Phase[]) {
  if (phase.status === 'current') return `Days 1–${phase.length_days} · You are here`
  if (phase.status === 'complete') return 'Complete'
  const nextIndex = phases.findIndex((item) => item.status === 'upcoming')
  if (index === nextIndex) {
    const current = phases.find((item) => item.status === 'current')
    return current ? `Next up · Starts after ${current.name}` : 'Next up'
  }
  return 'Locked'
}

function catalogPhase(catalog: Catalog | null, selection: Selection, name: string): CatalogPhase | undefined {
  return catalog?.identities
    .find((identity) => identity.id === selection.identity_id)
    ?.directions.find((direction) => direction.id === selection.direction_id)
    ?.phases.find((phase) => phase.name === name)
}

function askText(phase: CatalogPhase | undefined, fallback: string) {
  const base = phase?.commitments.find((item) => item.kind === 'base')
  return base?.implementations[0]?.title ?? fallback
}

function whyText(phase: CatalogPhase | undefined, fallback: string) {
  if (!phase) return fallback
  if (phase.headline && phase.headline !== phase.name) return phase.headline
  return phase.commitments[0]?.objective ?? phase.headline
}
