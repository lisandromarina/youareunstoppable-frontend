import { useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router'

import { markOnboarding } from '../api/admin'
import { IdentityLabel } from '../components/identityTint'
import { identityTint } from '../components/tints'
import { PrimaryButton, Screen } from '../components/look'
import { useRecord } from '../data/record'

export function Direction() {
  const navigate = useNavigate()
  const catalog = useRecord((state) => state.catalog)
  const ids = useRecord((state) => state.draftIdentityIds)
  const chosen = useRecord((state) => state.draftDirections)
  const chooseDirection = useRecord((state) => state.chooseDirection)
  const identities = catalog?.identities.filter((item) => ids.includes(item.id)) ?? []
  const ready = identities.length > 0 && identities.every((item) => chosen[item.id])

  useEffect(() => {
    void markOnboarding('direction')
  }, [])

  if (ids.length === 0) return <Navigate to="/identity" replace />

  return (
    <Screen className="min-h-svh max-w-lg!">
      <h1 className="max-w-sm text-[34px] leading-tight font-extrabold tracking-tight">
        Where are you going?
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground">One direction for each identity.</p>
      <div className="mt-10 flex flex-col gap-10">
        {identities.map((identity) => (
          <section key={identity.id}>
            <IdentityLabel identityId={identity.id}>{identity.name.toUpperCase()}</IdentityLabel>
            <div className="mt-3 flex flex-col">
              {identity.directions.map((direction) => {
                const selected = chosen[identity.id] === direction.id
                return (
                  <button
                    key={direction.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => chooseDirection(identity.id, direction.id)}
                    className="border-b border-white/8 py-4 text-left text-[17px] font-semibold"
                    style={selected ? { color: identityTint(identity.id) } : undefined}
                  >
                    {direction.name}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      <PrimaryButton className="mt-10" type="button" disabled={!ready} onClick={() => navigate('/path')}>
        Continue
      </PrimaryButton>
    </Screen>
  )
}
