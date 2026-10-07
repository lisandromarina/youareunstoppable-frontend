import { Link } from 'react-router'

import { cn } from 'cn'
import { PrimaryButton, Screen } from '../components/look'
import { ReleaseNote } from '../components/ReleaseNote'

type Day = 'showed' | 'missed' | 'today' | 'ahead'

const days: Day[] = [
  'showed',
  'showed',
  'showed',
  'showed',
  'showed',
  'missed',
  'showed',
  'today',
  'ahead',
  'ahead',
  'ahead',
  'ahead',
  'ahead',
  'ahead',
]

const dayClass: Record<Day, string> = {
  showed: 'bg-primary',
  missed: 'bg-[#8d6a3e]',
  today: 'bg-transparent ring-2 ring-inset ring-primary',
  ahead: 'bg-empty',
}

const identities = [
  { name: 'Disciplined', selected: false },
  { name: 'Healthy', selected: true },
  { name: 'Focused', selected: false },
]

const steps = [
  {
    title: 'Choose who you’re becoming',
    body: 'Each one comes with a path already built.',
  },
  {
    title: 'Keep today’s promise',
    titleWide: 'Keep today’s promises',
    body: 'One small ask a day. No program to design.',
    bodyWide: 'A few small asks a day. Keep one and the day counts. No program to design.',
  },
  {
    title: 'Watch the days stack up',
    body: 'Every day you show up becomes a block. Blocks never disappear.',
  },
]

const beginButton =
  'rounded-full shadow-[0_12px_32px_-8px_rgba(255,137,6,0.7)] lg:w-auto lg:max-w-none lg:px-8 lg:py-3'

export function Invite() {
  return (
    <Screen className="min-h-svh max-w-md px-5 py-6 sm:px-6 sm:py-8 md:px-6 lg:max-w-6xl lg:px-12 lg:py-10 xl:max-w-7xl xl:px-16">
      <header className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-muted-foreground uppercase sm:text-xs">
          YouAreUnstoppable
        </p>
        <Link to="/sign-in" className="text-[15px] font-semibold text-foreground lg:text-primary">
          Sign in
        </Link>
      </header>

      <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.9fr)] lg:items-center lg:gap-14 xl:mt-20 xl:gap-20">
        <div>
          <h1 className="max-w-[10.5ch] text-[2.65rem] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-5xl lg:max-w-[11ch] lg:text-[3.35rem] xl:text-[3.75rem]">
            Become someone who keeps their word.
          </h1>
          <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-muted-foreground sm:text-[17px] lg:mt-6 lg:max-w-md lg:text-[18px]">
            <span className="lg:hidden">
              Pick who you’re becoming. Get a path and one promise a day. Miss a day? It takes nothing away.
            </span>
            <span className="hidden lg:inline">
              Pick who you’re becoming. Get a path and a few promises a day. Miss a day? It takes nothing away.
            </span>
          </p>
          <div className="mt-7 lg:mt-8 lg:flex lg:items-center lg:gap-5">
            <PrimaryButton className={beginButton} asChild>
              <Link to="/register">Begin</Link>
            </PrimaryButton>
            <p className="mt-6 hidden text-[15px] text-muted-foreground lg:mt-0 lg:block">
              Already a member?{' '}
              <Link to="/sign-in" className="font-semibold text-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <PromiseCard className="mt-9 lg:mt-0" />
      </div>

      <ol className="mt-14 grid gap-11 lg:mt-20 lg:grid-cols-3 lg:gap-12 xl:mt-24">
        {steps.map((step, index) => (
          <li key={step.title}>
            <p className="text-[12px] font-extrabold tracking-[0.14em] text-primary">0{index + 1}</p>
            <h2 className="mt-3 text-[26px] leading-[1.15] font-extrabold tracking-tight text-balance sm:text-[28px]">
              <span className={step.titleWide ? 'lg:hidden' : undefined}>{step.title}</span>
              {step.titleWide ? <span className="hidden lg:inline">{step.titleWide}</span> : null}
            </h2>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              <span className={step.bodyWide ? 'lg:hidden' : undefined}>{step.body}</span>
              {step.bodyWide ? <span className="hidden lg:inline">{step.bodyWide}</span> : null}
            </p>
            {index === 0 ? <IdentityChips /> : null}
          </li>
        ))}
      </ol>

      <div className="mt-14 border-t border-white/8 pt-12 lg:mt-16 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:pt-12 xl:mt-20">
        <h2 className="max-w-[12ch] text-[2rem] leading-[1.08] font-extrabold tracking-tight sm:max-w-md sm:text-[2.5rem] lg:max-w-none lg:text-[2.6rem] xl:text-5xl">
          Miss a day. Keep the rest.
        </h2>
        <PrimaryButton className={cn(beginButton, 'mt-7 lg:mt-0 lg:shrink-0')} asChild>
          <Link to="/register">Begin</Link>
        </PrimaryButton>
      </div>
      <p className="mt-6 text-[15px] text-muted-foreground lg:hidden">
        Already a member?{' '}
        <Link to="/sign-in" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
      <ReleaseNote variant="landing" className="mt-10 lg:mt-8" />
    </Screen>
  )
}

function PromiseCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[1.35rem] border border-white/8 bg-card px-5 py-5 sm:px-6 sm:py-6', className)}>
      <div className="lg:hidden">
        <p className="text-[11px] font-extrabold tracking-[0.16em] text-primary">TODAY’S PROMISE</p>
        <p className="mt-3 max-w-[16ch] text-[1.65rem] leading-[1.15] font-extrabold tracking-tight">
          Walk for 10 minutes after lunch.
        </p>
      </div>
      <div className="hidden lg:block">
        <p className="text-[11px] font-extrabold tracking-[0.16em] text-primary">TODAY’S PROMISES</p>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center gap-3 text-[17px] font-extrabold tracking-tight">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckIcon />
            </span>
            Walk for 10 minutes after lunch.
          </li>
          <li className="flex items-center gap-3 text-[17px] font-extrabold tracking-tight">
            <span className="size-5 shrink-0 rounded-full border-2 border-white/35" />
            Stretch for 5 minutes tonight.
          </li>
        </ul>
      </div>
      <div
        className="mt-5 grid grid-cols-7 gap-1.5 lg:mt-6 lg:w-fit lg:gap-2.5"
        role="img"
        aria-label="Sample of 14 days. Six showed up, one was missed, and day 8 is today."
      >
        {days.map((day, index) => (
          <span key={index} className={cn('aspect-square rounded-[8px] lg:size-11 lg:aspect-auto', dayClass[day])} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-[3px] bg-primary" aria-hidden />
          Showed up
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-[3px] bg-[#8d6a3e]" aria-hidden />
          Missed. Nothing lost.
        </span>
      </div>
      <p className="mt-4 text-[14px] text-muted-foreground">Day 8 of about 14</p>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
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

function IdentityChips() {
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Example identities">
      {identities.map((identity) => (
        <li key={identity.name}>
          <span
            className={cn(
              'inline-flex rounded-full border px-3.5 py-1.5 text-[14px] font-semibold',
              identity.selected ? 'border-primary text-foreground' : 'border-white/15 text-foreground/90',
            )}
          >
            {identity.name}
          </span>
        </li>
      ))}
    </ul>
  )
}
