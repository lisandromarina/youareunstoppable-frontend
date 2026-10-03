import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { cn } from 'cn'
import { IdentityLabel, PhaseDot } from '../components/identityTint'
import { PrimaryButton, Screen } from '../components/look'
import { useRecord } from '../data/record'

export function Path() {
  const navigate = useNavigate()
  const catalog = useRecord((state) => state.catalog)
  const ids = useRecord((state) => state.draftIdentityIds)
  const chosen = useRecord((state) => state.draftDirections)
  const record = useRecord((state) => state.record)
  const pending = useRecord((state) => state.pending)
  const start = useRecord((state) => state.start)
  const saveSelections = useRecord((state) => state.saveSelections)
  const [failed, setFailed] = useState<string | null>(null)

  const paths =
    catalog?.identities
      .filter((identity) => ids.includes(identity.id))
      .map((identity) => {
        const direction = identity.directions.find((item) => item.id === chosen[identity.id])
        return direction ? { identity, direction } : null
      })
      .filter((item) => item !== null) ?? []

  if (ids.length === 0) return <Navigate to="/identity" replace />

  async function commit() {
    setFailed(null)
    try {
      if (record) await saveSelections()
      else await start()
      navigate('/today')
    } catch {
      setFailed(useRecord.getState().error ?? 'The path could not be saved.')
    }
  }

  return (
    <Screen className="min-h-svh max-w-lg!">
      <h1 className="max-w-sm text-[34px] leading-tight font-extrabold tracking-tight">
        How will you get there?
      </h1>
      <div className="mt-10 flex flex-col gap-12">
        {paths.map(({ identity, direction }) => {
          const first = direction.phases[0]
          return (
            <section key={identity.id}>
              <IdentityLabel identityId={identity.id}>{identity.name.toUpperCase()}</IdentityLabel>
              <ol className="mt-4 flex flex-col">
                {direction.phases.map((phase, index) => (
                  <li key={phase.id} className="flex gap-3">
                    <span className="flex flex-col items-center">
                      <PhaseDot identityId={identity.id} status={index === 0 ? 'current' : 'upcoming'} />
                      {index < direction.phases.length - 1 ? (
                        <span className="my-1 h-6 w-px bg-white/10" />
                      ) : null}
                    </span>
                    <span className={cn('pb-3 text-[16px] font-semibold', index > 0 && 'text-white/35')}>
                      {phase.name}
                    </span>
                  </li>
                ))}
              </ol>
              {first ? (
                <div className="mt-2">
                  <p className="text-[11px] font-extrabold tracking-[0.14em] text-primary">Your first phase</p>
                  <h2 className="mt-2 text-[26px] font-extrabold">{first.headline}</h2>
                  <p className="mt-3 text-[15px] text-muted-foreground">About {first.length_days} days.</p>
                  <p className="text-[15px] text-muted-foreground">One day at a time.</p>
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
      {failed ? (
        <p className="mt-6 text-sm font-semibold text-destructive" role="alert">
          {failed}
        </p>
      ) : null}
      <PrimaryButton className="mt-10" type="button" disabled={pending || paths.length === 0} onClick={() => void commit()}>
        {record ? 'Update my path' : 'Start my transformation'}
      </PrimaryButton>
    </Screen>
  )
}
