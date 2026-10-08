import { useState } from 'react'

import { startCheckout } from '../api/billing'
import { errorMessage } from '../api/client'

const POINTS = [
  'A plan in your words, with a quick win first.',
  'More goals as your streak grows. One again after a gap.',
  "Adjust today when you're tired or short on time.",
]

export function UpgradePrompt({ onClose }: { onClose: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function upgrade() {
    setError(null)
    setPending(true)
    void startCheckout()
      .then(({ url }) => {
        window.location.assign(url)
      })
      .catch((caught: unknown) => {
        setError(errorMessage(caught))
        setPending(false)
      })
  }

  return (
    <div
      className="w-full max-w-md rounded-[1.6rem] border border-white/10 bg-card px-6 py-7 shadow-2xl"
      role="dialog"
      aria-labelledby="upgrade-title"
    >
      <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.16em]">
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] tracking-wide text-primary-foreground">PRO</span>
        YOUR COACH
      </p>
      <h2 id="upgrade-title" className="mt-4 text-[1.85rem] leading-[1.05] font-extrabold tracking-tight">
        Start with the bed. The rest waits until you’ve shown up.
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
        A coach that sets each day’s size from what you tell it and how you’ve been showing up.
      </p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-[15px] leading-snug">
            <Check />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={pending}
        onClick={upgrade}
        className="mt-6 w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-extrabold text-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Opening…' : 'Upgrade to Pro'}
      </button>
      {error ? (
        <p className="mt-3 text-sm font-semibold text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button type="button" onClick={onClose} className="mt-3 w-full py-2 text-[15px] font-semibold text-foreground/80">
        Not now
      </button>
    </div>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden>
      <path
        d="M3.2 8.3 6.3 11.2 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
