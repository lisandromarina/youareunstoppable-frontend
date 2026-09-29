import { useEffect } from 'react'
import { Outlet } from 'react-router'

import { useRecord } from '../data/record'
import { Ground } from './SessionGate'
import { PrimaryButton, Screen } from './look'

export function RecordGate() {
  const status = useRecord((state) => state.status)
  const error = useRecord((state) => state.error)
  const load = useRecord((state) => state.load)

  useEffect(() => {
    if (status === 'idle') void load()
  }, [load, status])

  if (status === 'idle' || status === 'loading') return <Ground />

  if (status === 'error') {
    return (
      <Screen className="min-h-svh max-w-lg!">
        <h1 className="text-[28px] font-extrabold">The path didn't load.</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">{error}</p>
        <PrimaryButton className="mt-8" type="button" onClick={() => void load()}>
          Try again
        </PrimaryButton>
      </Screen>
    )
  }

  return <Outlet />
}
