import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'

import { errorMessage } from '../api/client'
import { GoogleButton } from '../components/GoogleButton'
import { Eyebrow, GhostButton, PrimaryButton, Screen } from '../components/look'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useSession } from '../session/store'

type CredentialScreenProps = {
  eyebrow: string
  title: string
  lede: string
  submitLabel: string
  passwordAutoComplete: 'new-password' | 'current-password'
  passwordHint?: string
  minPassword: number
  googleLabel: string
  googleText: 'signin_with' | 'signup_with'
  alternate: { to: string; label: string }
  next: string
  onSubmit: (email: string, password: string) => Promise<void>
}

export function CredentialScreen({
  eyebrow,
  title,
  lede,
  submitLabel,
  passwordAutoComplete,
  passwordHint,
  minPassword,
  googleLabel,
  googleText,
  alternate,
  next,
  onSubmit,
}: CredentialScreenProps) {
  const navigate = useNavigate()
  const signInWithGoogle = useSession((state) => state.signInWithGoogle)
  const closedMessage = useSession((state) => state.closedMessage)
  const clearClosedMessage = useSession((state) => state.clearClosedMessage)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const googleReady = Boolean(import.meta.env.GOOGLE_CLIENT_ID)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    clearClosedMessage()
    setPending(true)
    try {
      await onSubmit(email.trim(), password)
      navigate(next, { replace: true })
    } catch (caught) {
      setError(errorMessage(caught))
      setPending(false)
    }
  }

  async function onGoogle(idToken: string) {
    setError(null)
    clearClosedMessage()
    setPending(true)
    try {
      await signInWithGoogle(idToken)
      navigate(next, { replace: true })
    } catch (caught) {
      setError(errorMessage(caught))
      setPending(false)
    }
  }

  const message = error ?? closedMessage

  return (
    <Screen className="min-h-svh items-center justify-center">
      <div className="w-full max-w-md">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-[33px] leading-[1.14] font-extrabold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-[36ch] text-[15.5px] leading-normal text-muted-foreground">{lede}</p>
        <form className="mt-8 flex flex-col gap-4" onSubmit={(event) => void submit(event)}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-xs font-extrabold tracking-wide text-primary">
            Email
          </Label>
          <Input
            id="email"
            className="h-14 rounded-2xl bg-card px-4 text-base"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-xs font-extrabold tracking-wide text-primary">
            Password
          </Label>
          <Input
            id="password"
            className="h-14 rounded-2xl bg-card px-4 text-base"
            type="password"
            name="password"
            autoComplete={passwordAutoComplete}
            required
            minLength={minPassword}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {passwordHint ? <p className="text-xs text-muted-foreground">{passwordHint}</p> : null}
        </div>
        {message ? (
          <p className="text-sm font-semibold text-primary" role="alert">
            {message}
          </p>
        ) : null}
        <PrimaryButton type="submit" disabled={pending}>
          {submitLabel}
        </PrimaryButton>
        {googleReady ? (
          <p className="text-center text-xs font-bold tracking-widest text-muted-foreground uppercase">or</p>
        ) : null}
        <GoogleButton
          disabled={pending}
          label={googleLabel}
          text={googleText}
          onCredential={(idToken) => void onGoogle(idToken)}
        />
        <GhostButton asChild>
          <Link to={alternate.to}>{alternate.label}</Link>
          </GhostButton>
        </form>
      </div>
    </Screen>
  )
}
