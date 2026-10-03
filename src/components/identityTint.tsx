import type { CSSProperties, ReactNode } from 'react'

import { cn } from 'cn'

import { identityTint } from './tints'

export function IdentityLabel({
  identityId,
  children,
  className,
}: {
  identityId: string
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn('text-[11px] font-extrabold tracking-[0.14em]', className)}
      style={{ color: identityTint(identityId) }}
    >
      {children}
    </p>
  )
}

export function PhaseDot({
  identityId,
  status,
}: {
  identityId: string
  status: 'complete' | 'current' | 'upcoming'
}) {
  if (status === 'upcoming') {
    return <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-white/15" />
  }

  const tint = identityTint(identityId)
  return (
    <span
      className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', status === 'current' && 'phase-current')}
      style={{ backgroundColor: tint, '--dot': tint } as CSSProperties}
    />
  )
}
