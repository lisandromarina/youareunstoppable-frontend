import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { errorMessage } from '../api/client'
import { PremiumSoon } from '../components/PremiumSoon'
import { Sheet, SheetChoice } from '../components/Sheet'
import { GhostButton, Screen } from '../components/look'
import { useRecord } from '../data/record'
import { useSession } from '../session/store'

export function Profile() {
  const navigate = useNavigate()
  const user = useSession((state) => state.user)
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)
  const beginEdit = useRecord((state) => state.beginEdit)
  const reset = useRecord((state) => state.reset)
  const pending = useRecord((state) => state.pending)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record || !user) return null

  return (
    <Screen className="max-w-lg! pb-28 md:pb-12">
      <h1 className="max-w-sm text-[28px] leading-snug font-extrabold">{record.statement}</h1>

      <p className="mt-10 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Current direction</p>
      <div className="mt-3">
        {record.selections.map((selection) => (
          <p key={selection.identity_id} className="py-2 text-[17px] font-semibold">
            {selection.direction_name}
          </p>
        ))}
      </div>
      <button
        type="button"
        className="mt-1 text-sm font-bold text-primary"
        onClick={() => {
          beginEdit()
          navigate('/direction')
        }}
      >
        Change direction
      </button>

      <p className="mt-10 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Identities</p>
      <div className="mt-3">
        {record.selections.map((selection) => (
          <p key={selection.identity_id} className="py-2 text-[17px] font-semibold">
            {selection.identity_name}
          </p>
        ))}
      </div>
      <button
        type="button"
        className="mt-1 text-sm font-bold text-primary"
        onClick={() => {
          beginEdit()
          navigate('/identity')
        }}
      >
        Edit identities
      </button>

      <div className="mt-12 border-t border-white/8 pt-8">
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-1 text-sm font-semibold">{user.subscription.plan === 'pro' ? 'Pro' : 'Free'}</p>
        <SignOut />
      </div>

      <div className="mt-16">
        {resetError ? (
          <p className="mb-3 text-sm font-semibold text-primary" role="alert">
            {resetError}
          </p>
        ) : null}
        <button
          type="button"
          className="text-sm font-semibold text-muted-foreground"
          onClick={() => setConfirmReset(true)}
        >
          Reset prototype
        </button>
      </div>

      <PremiumSoon />

      <Sheet
        open={confirmReset}
        title="Start again?"
        lede="This clears your transformation. Your account stays."
        onClose={() => setConfirmReset(false)}
      >
        <SheetChoice
          label={pending ? 'Resetting…' : 'Reset prototype'}
          onClick={() => {
            setResetError(null)
            void reset()
              .then(() => navigate('/begin'))
              .catch(() => setResetError(useRecord.getState().error ?? 'Reset failed.'))
          }}
        />
        <SheetChoice label="Keep going" onClick={() => setConfirmReset(false)} />
      </Sheet>
    </Screen>
  )
}

function SignOut() {
  const logout = useSession((state) => state.logout)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="mt-4">
      {error ? (
        <p className="mb-2 text-sm font-semibold text-primary" role="alert">
          {error}
        </p>
      ) : null}
      <GhostButton
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null)
          setPending(true)
          void logout().catch((caught: unknown) => {
            setError(errorMessage(caught))
            setPending(false)
          })
        }}
      >
        Sign out
      </GhostButton>
    </div>
  )
}
