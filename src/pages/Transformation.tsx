import { Link } from 'react-router'

import { Eyebrow, PrimaryButton, Screen } from '../components/look'
import { useIdentity } from '../data/identity'

const pillars = [
  ['Discipline', 'Keep promises to yourself.'],
  ['Strength', "Build a body you're proud of."],
  ['Focus', 'Do meaningful work every day.'],
  ['Growth', 'Become better than yesterday.'],
] as const

export function Transformation() {
  const traits = useIdentity((state) => state.traits)
  const statement =
    traits.length > 0 ? `${traits.join('. ')}.` : 'Disciplined. Strong. Focused. Unstoppable.'

  return (
    <Screen className="min-h-svh">
      <div>
        <Eyebrow>This is who you're becoming</Eyebrow>
        <h1 className="text-[29px] leading-tight font-extrabold">{statement}</h1>
        <p className="mt-5 text-[15.5px] font-semibold">Your transformation starts today.</p>
      </div>
      <div>
        <div className="mt-6 rounded-[20px] border border-border bg-card p-5">
          {pillars.map(([title, line]) => (
            <div key={title} className="border-b border-border py-4 last:border-b-0">
              <p className="text-xs font-extrabold tracking-wide text-primary">{title}</p>
              <p className="mt-1 text-[15px] font-semibold">{line}</p>
            </div>
          ))}
        </div>
        <PrimaryButton asChild className="mt-8">
          <Link to="/today">Let's begin →</Link>
        </PrimaryButton>
      </div>
    </Screen>
  )
}
