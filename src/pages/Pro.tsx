import { Link, useNavigate } from 'react-router'

import { Eyebrow, GhostButton, PrimaryButton, Screen } from '../components/look'

const free = [
  "Define who you're becoming",
  'Daily commitments',
  'Daily completion',
  'Current streak',
  'Monthly journey grid',
  'Basic journal',
  '7-day history',
  'Limited AI coaching',
]

const pro = [
  'Full 365-day journey',
  'Unlimited history',
  'Personalized daily plans',
  'AI transformation coach',
  'Unlimited journal',
  'Weekly transformation reviews',
  'Advanced insights',
  'Multiple transformation areas',
  'Personalized challenges',
  'Custom commitments',
]

export function Pro() {
  const navigate = useNavigate()

  return (
    <Screen className="relative min-h-svh">
      <button
        type="button"
        className="absolute top-6 right-6 text-2xl text-muted-foreground md:right-12"
        onClick={() => navigate('/journey')}
        aria-label="Close"
      >
        ×
      </button>
      <Eyebrow>Unstoppable Pro</Eyebrow>
      <h1 className="max-w-xl text-[25px] leading-snug font-extrabold">
        Don't just track your transformation.
        <br />
        Build it.
      </h1>
      <div className="mt-6 grid gap-3.5 lg:grid-cols-2">
        <Plan title="Free" items={free} featured={false} />
        <Plan title="Unstoppable Pro" items={pro} featured />
      </div>
      <PrimaryButton className="mt-8" type="button">
        Become Unstoppable →
      </PrimaryButton>
      <GhostButton asChild>
        <Link to="/today">Continue with Free</Link>
      </GhostButton>
    </Screen>
  )
}

function Plan({ title, items, featured }: { title: string; items: string[]; featured: boolean }) {
  return (
    <div
      className={`rounded-[22px] p-6 ${featured ? 'border border-primary bg-[linear-gradient(160deg,#241a0c,#17151f)]' : 'border border-border bg-card'}`}
    >
      <p className={`mb-2.5 text-xs font-extrabold tracking-wide ${featured ? 'text-primary' : 'text-muted-foreground'}`}>
        {title}
      </p>
      <ul>
        {items.map((item) => (
          <li key={item} className="flex gap-2 py-2 text-sm">
            <b className="text-primary">✓</b>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
