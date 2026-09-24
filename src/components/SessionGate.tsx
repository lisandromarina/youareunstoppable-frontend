import { useState } from 'react'
import { Navigate, Outlet } from 'react-router'

import { useSession } from '../session/store'
import type { SessionStatus } from '../session/types'

export function Ground() {
  return (
    <div className="min-h-svh bg-background" aria-busy="true">
      <span className="sr-only">Loading</span>
    </div>
  )
}

export function PublicOnly() {
  const status = useSession((state) => state.status)
  const [initial, setInitial] = useState<SessionStatus | null>(null)

  if (status !== 'unknown' && initial === null) {
    setInitial(status)
  }

  if (status === 'unknown' || initial === null) return <Ground />
  if (initial === 'authenticated') return <Navigate to="/today" replace />
  return <Outlet />
}

export function RequireAuth() {
  const status = useSession((state) => state.status)
  if (status === 'unknown') return <Ground />
  if (status !== 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
