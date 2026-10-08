import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'

import {
  applyCoach,
  loadCoachThread,
  sendCoachMessage,
  type CoachGoal,
  type CoachProposal,
  type CoachTurn,
} from '../api/coach'
import { errorMessage } from '../api/client'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { useRecord } from '../data/record'
import { coachEntitled } from '../session/access'
import { useSession } from '../session/store'

const ADJUST = 'I only have a little time today.'
const OPENER = 'What can you already do, and what do you want to work on?'

type ThreadItem =
  | { kind: 'turn'; turn: CoachTurn }
  | { kind: 'offer'; proposal: CoachProposal; quiet: boolean }

export function Coach() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const user = useSession((state) => state.user)
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)
  const entitled = coachEntitled(user)
  const field = useRef<HTMLInputElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState(params.get('adjust') === '1' ? ADJUST : '')
  const [items, setItems] = useState<ThreadItem[]>([])
  const [ready, setReady] = useState(!entitled)
  const [pending, setPending] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entitled) return
    let cancelled = false
    void loadCoachThread()
      .then((thread) => {
        if (cancelled) return
        const next: ThreadItem[] = thread.transcript.map((turn) => ({ kind: 'turn', turn }))
        if (thread.proposal) next.push({ kind: 'offer', proposal: thread.proposal, quiet: false })
        setItems(next)
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(errorMessage(caught))
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [entitled])

  useEffect(() => {
    const node = scroller.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [items, ready, thinking])

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record) return null

  const names = new Map(record.selections.map((item) => [item.identity_id, item.identity_name]))

  async function send() {
    const message = draft.trim()
    if (!message || thinking || pending) return
    setThinking(true)
    setError(null)
    setDraft('')
    setItems((current) => [
      ...current.map((item) => (item.kind === 'offer' ? { ...item, quiet: true } : item)),
      { kind: 'turn', turn: { role: 'user', content: message } },
    ])
    try {
      const next = await sendCoachMessage(message)
      setItems((current) => [
        ...current,
        { kind: 'turn', turn: { role: 'coach', content: next.reply } },
        ...(next.proposal ? [{ kind: 'offer' as const, proposal: next.proposal, quiet: false }] : []),
      ])
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setThinking(false)
    }
  }

  const lastOffer = items.findLastIndex((item) => item.kind === 'offer')

  async function confirm() {
    if (pending || lastOffer < 0) return
    setPending(true)
    setError(null)
    try {
      const next = await applyCoach()
      useRecord.setState({ record: next, status: 'ready', error: null })
      navigate('/today')
    } catch (caught) {
      setError(errorMessage(caught))
      setPending(false)
    }
  }

  if (!entitled) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <UpgradePrompt onClose={() => navigate('/today')} />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/8 px-4 py-3">
        <Link to="/today" className="inline-flex items-center gap-1 text-[15px] font-semibold text-foreground/80">
          <BackChevron />
          Today
        </Link>
        <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.16em]">
          YOUR COACH
          <ProMark />
        </p>
        <span />
      </header>

      <div ref={scroller} className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {ready && !items.some((item) => item.kind === 'turn' && item.turn.role === 'coach') ? (
          <CoachBubble>{OPENER}</CoachBubble>
        ) : null}
        {items.map((item, index) =>
          item.kind === 'turn' ? (
            item.turn.role === 'user' ? (
              <UserBubble key={`${index}-${item.turn.content}`}>{item.turn.content}</UserBubble>
            ) : (
              <CoachBubble key={`${index}-${item.turn.content}`}>{item.turn.content}</CoachBubble>
            )
          ) : (
            <ProposalCard
              key={`${index}-${item.proposal.goals[0]?.title ?? 'plan'}`}
              proposal={item.proposal}
              names={names}
              pending={pending}
              quiet={item.quiet}
              actions={index === lastOffer}
              onConfirm={() => void confirm()}
              onChange={() => field.current?.focus()}
            />
          ),
        )}
        {thinking ? <Thinking /> : null}
        {error ? (
          <p className="text-sm font-semibold text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <form
        className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        <input
          ref={field}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={thinking || pending || !ready}
          placeholder="Say it in your own words"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-card px-4 py-3.5 text-[16px] outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={thinking || pending || !ready || draft.trim().length === 0}
          className="rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-extrabold text-primary-foreground disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}

function ProposalCard({
  proposal,
  names,
  pending,
  quiet,
  actions,
  onConfirm,
  onChange,
}: {
  proposal: CoachProposal
  names: Map<string, string>
  pending: boolean
  quiet: boolean
  actions: boolean
  onConfirm: () => void
  onChange: () => void
}) {
  return (
    <section
      className={
        quiet
          ? 'rounded-[1.35rem] border border-white/15 bg-card p-4'
          : 'rounded-[1.35rem] border border-primary/70 bg-card p-4'
      }
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <p
          className={
            quiet
              ? 'text-[11px] font-extrabold tracking-[0.16em] text-muted-foreground'
              : 'text-[11px] font-extrabold tracking-[0.16em] text-primary'
          }
        >
          PROPOSED PLAN
        </p>
        <p className="text-[13px] text-muted-foreground">In order</p>
      </div>
      <ol className="mt-3">
        {proposal.goals.map((goal, index) => (
          <li
            key={`${goal.identity_id}-${goal.position}-${goal.title}`}
            className="flex items-start gap-3 border-t border-white/8 py-3.5 first:border-t-0"
          >
            <span
              className={
                index === 0 && !quiet
                  ? 'flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-extrabold text-primary-foreground'
                  : 'flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-white/25 text-[13px] font-semibold text-muted-foreground'
              }
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              {names.size > 1 ? (
                <span className="mb-1 block text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground">
                  {(names.get(goal.identity_id) ?? goal.identity_id).toUpperCase()}
                </span>
              ) : null}
              <span className="block text-[16px] leading-snug font-extrabold">{goal.title}</span>
              {goal.reason ? (
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{goal.reason}</span>
              ) : null}
            </span>
            <span
              className={
                index === 0 && !quiet
                  ? 'shrink-0 pt-1 text-right text-[11px] font-extrabold tracking-[0.08em] text-primary'
                  : 'shrink-0 pt-1 text-right text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground'
              }
            >
              {paceLabel(goal, index, proposal.goals)}
            </span>
          </li>
        ))}
      </ol>
      <p className="rounded-xl bg-white/5 px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">
        {planNote(proposal)}
      </p>
      {actions ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-extrabold text-primary-foreground disabled:opacity-40"
          >
            {proposal.type === 'today' ? 'Use this today' : 'Start this plan'}
          </button>
          <button
            type="button"
            onClick={onChange}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-[15px] font-semibold"
          >
            Change it
          </button>
        </div>
      ) : null}
    </section>
  )
}

function planNote(proposal: CoachProposal) {
  if (proposal.type === 'today') return 'This is only for today. Tomorrow follows how you have been showing up.'
  if (proposal.goals.length < 2) return 'This is the quick win. Miss a day and you start here again.'
  return `Goals 2 to ${proposal.goals.length} join one at a time as you show up. Miss a day and you start from goal 1 again.`
}

function paceLabel(goal: CoachGoal, index: number, goals: CoachGoal[]) {
  if (index === 0) return `${cadenceWord(goal)} · QUICK WIN`
  if (goal.recurrence === 'once' && goal.due_on) return `ONCE · ${formatDue(goal.due_on)}`
  const earlier = goals.slice(0, index).filter((item) => item.recurrence !== 'once').length
  if (goal.recurrence === 'daily' && earlier > 0) {
    return `DAILY · AFTER ${earlier} ${earlier === 1 ? 'DAY' : 'DAYS'}`
  }
  return cadenceWord(goal)
}

function cadenceWord(goal: CoachGoal) {
  if (goal.recurrence === 'once') return 'ONCE'
  if (goal.recurrence === 'daily') return 'DAILY'
  if (goal.recurrence === 'weekly') return 'WEEKLY'
  if (goal.recurrence === 'monthly') return 'MONTHLY'
  return 'WEEKLY'
}

function formatDue(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  return `${weekday} ${monthName} ${date.getDate()}`
}

function Thinking() {
  return (
    <p className="flex max-w-[85%] items-center gap-2.5 self-start rounded-2xl rounded-bl-md border border-white/8 bg-card px-4 py-3 text-[15px] text-muted-foreground">
      <span
        className="size-3.5 animate-spin rounded-full border-2 border-white/15 border-t-primary"
        aria-hidden
      />
      Thinking
    </p>
  )
}

function CoachBubble({ children }: { children: string }) {
  return (
    <p className="max-w-[85%] self-start rounded-2xl rounded-bl-md border border-white/8 bg-card px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
      {children}
    </p>
  )
}

function UserBubble({ children }: { children: string }) {
  return (
    <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-4 py-3 text-[15px] leading-relaxed font-semibold text-primary-foreground">
      {children}
    </p>
  )
}

function ProMark() {
  return (
    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-primary-foreground">
      PRO
    </span>
  )
}

function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <path
        d="M10 3.5 5.5 8 10 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
