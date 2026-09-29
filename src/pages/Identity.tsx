import { useNavigate } from 'react-router'

import { cn } from 'cn'
import { PrimaryButton, Screen } from '../components/look'
import { useRecord } from '../data/record'

function becoming(names: string[]) {
  const lowered = names.map((name) => name.toLowerCase())
  if (lowered.length === 0) return 'I’m becoming…'
  if (lowered.length === 1) return `I’m becoming ${lowered[0]}.`
  return `I’m becoming ${lowered[0]} and ${lowered[1]}.`
}

export function Identity() {
  const navigate = useNavigate()
  const catalog = useRecord((state) => state.catalog)
  const ids = useRecord((state) => state.draftIdentityIds)
  const toggleIdentity = useRecord((state) => state.toggleIdentity)
  const names =
    catalog?.identities.filter((item) => ids.includes(item.id)).map((item) => item.name) ?? []

  return (
    <Screen className="min-h-svh max-w-lg!">
      <h1 className="max-w-sm text-[34px] leading-tight font-extrabold tracking-tight">
        Who are you becoming?
      </h1>
      <p className={`mt-4 text-[18px] font-semibold ${names.length === 0 ? 'text-muted-foreground' : ''}`}>
        {becoming(names)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">Choose one or two.</p>
      <div className="mt-8 flex flex-col">
        {catalog?.identities.map((identity) => {
          const selected = ids.includes(identity.id)
          return (
            <button
              key={identity.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleIdentity(identity.id)}
              className="flex items-center justify-between border-b border-white/8 py-4 text-left"
            >
              <span className="text-[17px] font-semibold">{identity.name}</span>
              <span
                className={cn(
                  'size-5 rounded-full border-2',
                  selected ? 'border-primary bg-primary' : 'border-white/20',
                )}
              />
            </button>
          )
        })}
      </div>
      <PrimaryButton
        className="mt-10"
        type="button"
        disabled={ids.length === 0}
        onClick={() => navigate('/direction')}
      >
        Continue
      </PrimaryButton>
    </Screen>
  )
}
