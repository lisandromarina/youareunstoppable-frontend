import { useEffect, useRef, useState } from 'react'

import { cn } from 'cn'

import { loadGoogleScript } from '../google'

type GoogleButtonProps = {
  disabled?: boolean
  label: string
  text: 'signin_with' | 'signup_with'
  onCredential: (idToken: string) => void
}

function alignToHost(node: HTMLDivElement) {
  const button = node.querySelector<HTMLElement>('[role="button"]')
  if (!button) return
  button.style.transform = 'none'
  const natural = button.getBoundingClientRect()
  const target = node.getBoundingClientRect()
  if (natural.width < 1 || natural.height < 1 || target.width < 1 || target.height < 1) return
  button.style.transformOrigin = 'left top'
  button.style.transform = `scale(${target.width / natural.width}, ${target.height / natural.height})`
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.3 5.6l6.3 5.3C37.4 38.3 44 33 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}

export function GoogleButton({ disabled = false, label, text, onCredential }: GoogleButtonProps) {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID
  const host = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)
  const disabledRef = useRef(disabled)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onCredentialRef.current = onCredential
    disabledRef.current = disabled
  }, [onCredential, disabled])

  useEffect(() => {
    const node = host.current
    if (!clientId || !node) return
    let cancelled = false
    let ready = false

    const mount = () => {
      if (cancelled || ready || !window.google) return
      const width = Math.floor(node.getBoundingClientRect().width)
      if (width < 200) return
      ready = true
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!disabledRef.current) onCredentialRef.current(response.credential)
        },
      })
      node.replaceChildren()
      window.google.accounts.id.renderButton(node, {
        theme: 'filled_black',
        size: 'large',
        text,
        shape: 'rectangular',
        width: 400,
      })
      alignToHost(node)
    }

    const observer = new ResizeObserver(() => {
      if (!ready) mount()
      else alignToHost(node)
    })
    observer.observe(node)

    loadGoogleScript()
      .then(() => {
        if (!cancelled) mount()
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [clientId, text])

  if (!clientId) return null
  if (failed) return <p className="text-sm font-semibold text-primary">Google sign-in could not be loaded.</p>

  return (
    <div className={cn('group relative w-full active:scale-[0.97]', disabled && 'pointer-events-none opacity-50')}>
      <div
        aria-hidden
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-base font-bold transition-colors group-hover:border-primary"
      >
        <GoogleMark />
        {label}
      </div>
      <div ref={host} className="absolute inset-0 overflow-hidden opacity-0" />
    </div>
  )
}
