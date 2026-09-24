import { useNavigate } from 'react-router'

import { cn } from 'cn'
import { PrimaryButton, Screen } from '../components/look'
import { TRAITS, useIdentity } from '../data/identity'

export function Becoming() {
  const navigate = useNavigate()
  const traits = useIdentity((state) => state.traits)
  const toggleTrait = useIdentity((state) => state.toggleTrait)

  return (
    <Screen className="min-h-svh">
      <h1 className="text-[25px] leading-tight font-extrabold">Who are you becoming?</h1>
      <p className="mt-3 max-w-md text-[15.5px] leading-normal text-muted-foreground">
        Don't choose goals. Choose the person you want to become.
      </p>
      <div className="mt-6 grid gap-2.5 md:grid-cols-2">
        {TRAITS.map((trait) => {
          const selected = traits.includes(trait)
          return (
            <button
              key={trait}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleTrait(trait)}
              className={cn(
                'flex items-center justify-between rounded-[14px] border bg-card px-4 py-4 text-left',
                selected
                  ? 'border-primary bg-[linear-gradient(135deg,rgba(255,137,6,0.14),rgba(255,137,6,0.03))]'
                  : 'border-border',
              )}
            >
              <span className="text-[15.5px] font-semibold">{trait}</span>
              <span
                className={cn(
                  'size-[18px] shrink-0 rounded-full border-2',
                  selected ? 'border-primary bg-primary' : 'border-border',
                )}
              />
            </button>
          )
        })}
      </div>
      <PrimaryButton
        className="mt-10 sm:w-full md:w-auto"
        type="button"
        disabled={traits.length === 0}
        onClick={() => navigate('/future-self')}
      >
        Continue →
      </PrimaryButton>
    </Screen>
  )
}
