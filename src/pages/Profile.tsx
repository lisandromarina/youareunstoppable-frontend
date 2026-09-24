import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'

import { Eyebrow, GhostButton, PrimaryButton, Screen } from '../components/look'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { errorMessage } from '../api/client'
import { useIdentity } from '../data/identity'
import { currentStreak, daysCompleted, longestStreak, useDay } from '../data/day'
import { useSession } from '../session/store'

const defaultTraits = ['Disciplined', 'Strong', 'Focused', 'Confident']

export function Profile() {
  const user = useSession((state) => state.user)
  const traits = useIdentity((state) => state.traits)
  const futureSelf = useIdentity((state) => state.futureSelf)
  const grid = useDay((state) => state.grid)
  const shown = traits.length > 0 ? traits : defaultTraits
  const quote = futureSelf.trim() || 'I am becoming someone who keeps promises to himself.'

  if (!user) return null

  const rows = [
    ['Email', user.email],
    ['Plan', user.subscription.plan === 'pro' ? 'Pro' : 'Free'],
    ['Transformation started', 'March 18, 2026'],
    ['Days completed', String(daysCompleted(grid))],
    ['Current streak', `${currentStreak(grid)} days`],
    ['Longest streak', `${longestStreak(grid)} days`],
  ]

  return (
    <Screen className="pb-28 md:pb-12">
      <Eyebrow>Your identity</Eyebrow>
      <h1 className="max-w-xl text-[21px] leading-snug font-extrabold italic">"{quote}"</h1>
      <div className="mt-6 max-w-xl rounded-[20px] border border-border bg-card px-5">
        {rows.map(([name, value]) => (
          <div key={name} className="border-b border-border py-4 last:border-b-0">
            <p className="text-xs font-extrabold tracking-wide text-primary">{name}</p>
            <p className="mt-1 text-[15px] font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <Eyebrow className="mt-6">I'm becoming</Eyebrow>
      <p className="mt-1.5 text-base font-bold">{shown.join(' · ')}</p>
      {user.subscription.plan === 'free' ? (
        <PrimaryButton asChild className="mt-5">
          <Link to="/pro">Upgrade to Pro</Link>
        </PrimaryButton>
      ) : (
        <p className="mt-5 text-sm font-semibold text-primary">Unstoppable Pro</p>
      )}
      {user.has_password ? null : <SetPassword />}
      <SignOut />
    </Screen>
  )
}

function SetPassword() {
  const setPassword = useSession((state) => state.setPassword)
  const [password, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await setPassword(password)
    } catch (caught) {
      setError(errorMessage(caught))
      setPending(false)
    }
  }

  return (
    <form className="mt-6 flex max-w-xl flex-col gap-3" onSubmit={(event) => void onSubmit(event)}>
      <Label htmlFor="new-password" className="text-xs font-extrabold tracking-wide text-primary">
        Password
      </Label>
      <Input
        id="new-password"
        className="h-14 rounded-2xl bg-card px-4 text-base"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        value={password}
        onChange={(event) => setValue(event.target.value)}
      />
      {error ? (
        <p className="text-sm font-semibold text-primary" role="alert">
          {error}
        </p>
      ) : null}
      <PrimaryButton type="submit" disabled={pending}>
        Set a password
      </PrimaryButton>
    </form>
  )
}

function SignOut() {
  const logout = useSession((state) => state.logout)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="mt-2">
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
