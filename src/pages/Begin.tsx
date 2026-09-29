import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { markOnboarding } from '../api/admin'
import { GhostButton, PrimaryButton, Screen } from '../components/look'
import { useRecord } from '../data/record'
import { useSession } from '../session/store'

export function Begin() {
  const navigate = useNavigate()
  const status = useRecord((state) => state.status)
  const logout = useSession((state) => state.logout)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    void markOnboarding('begin')
  }, [])

  if (status === 'ready') return <Navigate to="/today" replace />

  return (
    <Screen className="min-h-svh max-w-lg!">
      <div className="mt-[12vh]">
        <h1 className="max-w-sm text-[40px] leading-[1.05] font-extrabold tracking-tight">
          Who are you becoming?
        </h1>
        <p className="mt-5 max-w-xs text-[17px] leading-relaxed text-muted-foreground">
          Your next chapter starts with what you do today.
        </p>
      </div>
      <div className="mt-auto">
        <PrimaryButton type="button" onClick={() => navigate('/identity')}>
          Begin
        </PrimaryButton>
        <GhostButton
          className="mt-2"
          type="button"
          disabled={pending}
          onClick={() => {
            setPending(true)
            void logout().catch(() => setPending(false))
          }}
        >
          Sign out
        </GhostButton>
      </div>
    </Screen>
  )
}
