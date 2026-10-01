import { Component, useEffect, type ReactNode } from 'react'
import { Outlet } from 'react-router'

import { useRecord } from '../data/record'
import { useSession } from '../session/store'
import { Ground } from './SessionGate'
import { PrimaryButton, Screen } from './look'

export function RecordGate() {
  const userId = useSession((state) => state.user?.id)
  const status = useRecord((state) => state.status)
  const accountId = useRecord((state) => state.accountId)
  const error = useRecord((state) => state.error)
  const load = useRecord((state) => state.load)

  useEffect(() => {
    if (!userId || accountId === userId) return
    void load(userId)
  }, [accountId, load, userId])

  if (!userId || accountId !== userId || status === 'idle' || status === 'loading') return <Ground />

  if (status === 'error') {
    return (
      <Screen className="min-h-svh max-w-lg!">
        <h1 className="text-[28px] font-extrabold">The path didn't load.</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">{error}</p>
        <PrimaryButton className="mt-8" type="button" onClick={() => userId && void load(userId)}>
          Try again
        </PrimaryButton>
      </Screen>
    )
  }

  return (
    <PathBoundary>
      <Outlet />
    </PathBoundary>
  )
}

class PathBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <Screen className="min-h-svh max-w-lg!">
        <h1 className="text-[28px] font-extrabold">The path didn't load.</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">Refresh the page and try again.</p>
        <PrimaryButton className="mt-8" type="button" onClick={() => window.location.reload()}>
          Try again
        </PrimaryButton>
      </Screen>
    )
  }
}
