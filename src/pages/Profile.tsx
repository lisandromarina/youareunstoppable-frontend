import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { billingStatus, startCheckout, startPortal } from '../api/billing'
import { errorMessage } from '../api/client'
import { ReleaseNote } from '../components/ReleaseNote'
import { Sheet, SheetChoice } from '../components/Sheet'
import { Screen } from '../components/look'
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

  const directions = record.selections.map((selection) => selection.direction_name)
  const identities = record.selections.map((selection) => selection.identity_name)

  return (
    <Screen className="max-w-lg! px-5 pt-6 pb-32 lg:max-w-6xl! lg:px-10 lg:pt-10 lg:pb-12">
      <p className="text-[12px] font-extrabold tracking-[0.16em] text-primary">PROFILE</p>
      <h1 className="mt-3 max-w-3xl text-[2.35rem] leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
        {record.statement}
      </h1>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,42rem)_18rem] lg:items-start lg:gap-8 xl:gap-12">
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.16em] text-muted-foreground">YOUR PATH</p>
          <div className="mt-3 overflow-hidden rounded-[1.35rem] border border-white/8 bg-card">
            <PathRow
              label="Direction"
              values={directions}
              action="Change"
              onClick={() => {
                beginEdit()
                navigate('/direction')
              }}
            />
            <PathRow
              label="Who you’re becoming"
              values={identities}
              action="Edit"
              onClick={() => {
                beginEdit()
                navigate('/identity')
              }}
            />
          </div>

          <p className="mt-6 text-[11px] font-extrabold tracking-[0.16em] text-muted-foreground lg:mt-8">ACCOUNT</p>
          <div className="mt-3 overflow-hidden rounded-[1.35rem] border border-white/8 bg-card">
            <Billing email={user.email} subscription={user.subscription} />
            <button
              type="button"
                className="flex w-full items-center justify-between gap-4 border-t border-white/8 px-5 py-3.5 text-left"
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/progress')}
            >
              <span>
                <span className="block text-[16px] font-extrabold">Analytics</span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">
                  Your activity and trends over time
                </span>
              </span>
              <Chevron />
            </button>
            <SignOut />
          </div>
        </div>

        <aside className="mt-7">
          <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">
            DEVELOPER · TEST BUILDS ONLY
          </p>
          {resetError ? (
            <p className="mt-3 text-sm font-semibold text-destructive" role="alert">
              {resetError}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-3 w-full rounded-[1.25rem] border border-dashed border-white/25 px-4 py-4 text-[16px] font-semibold text-foreground"
            onClick={() => setConfirmReset(true)}
          >
            Reset prototype
          </button>
          <ReleaseNote className="mt-6" />
        </aside>
      </div>

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

function PathRow({
  label,
  values,
  action,
  onClick,
}: {
  label: string
  values: string[]
  action: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 border-t border-white/8 px-5 py-3.5 text-left first:border-t-0"
    >
      <span className="min-w-0">
        <span className="block text-[13px] text-muted-foreground">{label}</span>
        {values.map((value, index) => (
          <span key={`${value}-${index}`} className="mt-1 block text-[17px] leading-snug font-extrabold">
            {value}
          </span>
        ))}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[15px] font-semibold text-primary">
        {action}
        <Chevron className="text-primary" />
      </span>
    </button>
  )
}

function Billing({ email, subscription }: { email: string; subscription: Subscription }) {
  const refreshUser = useSession((state) => state.refreshUser)
  const [billingEnabled, setBillingEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false
    void billingStatus()
      .then((status) => {
        if (!cancelled) setBillingEnabled(status.enabled)
      })
      .catch(() => {
        if (!cancelled) setBillingEnabled(false)
      })
    return () => {
      cancelled = true
    }
  }, [])
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

  const note =
    subscription.subscription_status === 'past_due'
      ? 'Payment needs an update.'
      : checkoutSuccess && !notice
        ? 'Confirming your subscription…'
        : notice

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <p className="min-w-0 truncate text-[15px] text-foreground/90">{email}</p>
        {billingEnabled ? (
          <button
            type="button"
            disabled={pending}
            onClick={openBilling}
            className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-foreground/80 disabled:opacity-60"
          >
            {pending ? 'Opening…' : planLabel(subscription)}
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-foreground/80">
            {planLabel(subscription)}
          </span>
        )}
      </div>
      {note ? <p className="px-5 pb-3 text-sm text-muted-foreground">{note}</p> : null}
      {error ? (
        <p className="px-5 pb-3 text-sm font-semibold text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function SignOut() {
  const logout = useSession((state) => state.logout)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="border-t border-white/8">
      {error ? (
        <p className="px-5 pt-3 text-sm font-semibold text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-[16px] font-extrabold disabled:opacity-60"
        onClick={() => {
          setError(null)
          setPending(true)
          void logout().catch((caught: unknown) => {
            setError(errorMessage(caught))
            setPending(false)
          })
        }}
      >
        <LogoutIcon />
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}

function Chevron({ className = 'text-muted-foreground' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 ${className}`} aria-hidden>
      <path
        d="M6 3.5 10.5 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        d="M10 7V6a2 2 0 0 0-2-2H5v16h3a2 2 0 0 0 2-2v-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12h10m0 0-3.5-3.5M20 12l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
