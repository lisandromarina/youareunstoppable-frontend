import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { startCheckout, startPortal } from '../api/billing'
import { errorMessage } from '../api/client'
import { ReleaseNote } from '../components/ReleaseNote'
import { Sheet, SheetChoice } from '../components/Sheet'
import { GhostButton, Screen } from '../components/look'
import { useRecord } from '../data/record'
import { useSession } from '../session/store'
import type { Subscription } from '../session/types'

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
        <Billing subscription={user.subscription} />
        {user.role === 'admin' ? (
          <button
            type="button"
            className="mt-4 text-sm font-bold text-primary"
            onClick={() => navigate('/admin')}
          >
            Analytics
          </button>
        ) : null}
        <SignOut />
      </div>

      <div className="mt-16">
        {resetError ? (
          <p className="mb-3 text-sm font-semibold text-destructive" role="alert">
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

      <ReleaseNote className="mt-10" />

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

function planLabel(subscription: Subscription): string {
  if (subscription.plan !== 'pro') return 'Free'
  if (subscription.cancel_at_period_end && subscription.current_period_end) {
    const end = new Date(subscription.current_period_end)
    const date = end.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    return `Pro until ${date}`
  }
  return 'Pro'
}

function Billing({ subscription }: { subscription: Subscription }) {
  const refreshUser = useSession((state) => state.refreshUser)
  const [searchParams, setSearchParams] = useSearchParams()
  const checkoutSuccess = searchParams.get('checkout') === 'success'
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const pro = subscription.plan === 'pro'

  useEffect(() => {
    if (!checkoutSuccess) return
    let cancelled = false

    async function confirm() {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const next = await refreshUser()
          if (cancelled) return
          if (next.subscription.plan === 'pro') {
            setNotice(null)
            setSearchParams({}, { replace: true })
            return
          }
        } catch (caught: unknown) {
          if (cancelled) return
          setError(errorMessage(caught))
          setSearchParams({}, { replace: true })
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      if (cancelled) return
      setNotice('Your plan will appear once Stripe confirms it.')
      setSearchParams({}, { replace: true })
    }

    void confirm()
    return () => {
      cancelled = true
    }
  }, [checkoutSuccess, refreshUser, setSearchParams])

  const action = pending ? 'Opening…' : pro ? 'Manage billing' : 'Monthly Pro'

  function openBilling() {
    setError(null)
    setPending(true)
    const start = pro ? startPortal : startCheckout
    void start()
      .then(({ url }) => {
        window.location.assign(url)
      })
      .catch((caught: unknown) => {
        setError(errorMessage(caught))
        setPending(false)
      })
  }

  return (
    <div className="mt-1">
      <p className="text-sm font-semibold">{planLabel(subscription)}</p>
      {subscription.subscription_status === 'past_due' ? (
        <p className="mt-1 text-sm text-muted-foreground">Payment needs an update.</p>
      ) : null}
      {checkoutSuccess && !notice ? (
        <p className="mt-1 text-sm text-muted-foreground">Confirming your subscription…</p>
      ) : null}
      {notice ? <p className="mt-1 text-sm text-muted-foreground">{notice}</p> : null}
      {error ? (
        <p className="mt-2 text-sm font-semibold text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="mt-3 text-sm font-bold text-primary disabled:opacity-60"
        disabled={pending}
        onClick={openBilling}
      >
        {action}
      </button>
    </div>
  )
}

function SignOut() {
  const logout = useSession((state) => state.logout)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="mt-4">
      {error ? (
        <p className="mb-2 text-sm font-semibold text-destructive" role="alert">
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
