import { Link } from 'react-router'

import { cn } from 'cn'
import { IdentityLabel } from '../components/identityTint'
import { PrimaryButton, Screen, WarmGlow } from '../components/look'
import { ReleaseNote } from '../components/ReleaseNote'

const proof = [2, 2, 2, 2, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0]

const steps = [
  {
    title: 'Choose who you’re becoming',
    body: 'Disciplined. Healthy. Focused. One or two. A direction for each. The path is already built.',
  },
  {
    title: 'Show up for today',
    body: 'You see the promise that is due. Not a program you have to design.',
  },
  {
    title: 'Add the block',
    body: 'I showed up. That day stays. A missed day takes nothing away.',
  },
]

export function Invite() {
  return (
    <Screen className="min-h-svh max-w-5xl!">
      <header className="flex items-center justify-between gap-4">
        <p className="text-[12px] font-extrabold tracking-[0.18em] text-muted-foreground">YouAreUnstoppable</p>
        <Link to="/sign-in" className="text-[15px] font-semibold text-primary">
          Sign in
        </Link>
      </header>

      <div className="mt-16 grid items-center gap-14 md:mt-24 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:gap-16">
        <WarmGlow>
          <h1 className="max-w-xl text-[40px] leading-[1.05] font-extrabold tracking-tight md:text-[56px]">
            Show up for the person you’re becoming.
          </h1>
          <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted-foreground md:text-[20px]">
            A path is already waiting. Today asks one thing. Keep it, and the day becomes a block.
          </p>
          <PrimaryButton className="mt-8" asChild>
            <Link to="/register">Begin</Link>
          </PrimaryButton>
        </WarmGlow>
        <Proof />
      </div>

      <ol className="mt-20 grid gap-10 border-t border-white/8 pt-12 md:mt-28 md:grid-cols-3 md:gap-12">
        {steps.map((step, index) => (
          <li key={step.title}>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-primary">0{index + 1}</p>
            <h2 className="mt-3 text-[22px] leading-snug font-extrabold">{step.title}</h2>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-20 mb-6 border-t border-white/8 pt-12 md:mt-28">
        <h2 className="max-w-md text-[32px] leading-[1.1] font-extrabold tracking-tight md:text-[40px]">
          The person you want to become is built today.
        </h2>
        <PrimaryButton className="mt-8" asChild>
          <Link to="/register">Begin</Link>
        </PrimaryButton>
        <p className="mt-6 text-[15px] text-muted-foreground">
          Already a member?{' '}
          <Link to="/sign-in" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
        <ReleaseNote className="mt-10" />
      </div>
    </Screen>
  )
}

function Proof() {
  return (
    <div className="max-w-sm">
      <IdentityLabel identityId="disciplined">DISCIPLINED</IdentityLabel>
      <p className="mt-3 text-[26px] font-extrabold">Keep One Promise</p>
      <div className="mt-5 grid w-fit grid-cols-7 gap-2" aria-hidden>
        {proof.map((level, index) => (
          <span
            key={index}
            className={cn(
              'size-8 rounded-md',
              level === 0 && 'bg-empty',
              level === 1 && 'bg-primary/55',
              level === 2 && index !== 6 && 'bg-primary',
              index === 6 && 'block-fill',
              index === 7 && 'day-current',
            )}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Day 8</p>
      <p className="text-sm text-muted-foreground">About 14 days</p>
    </div>
  )
}
