import type { ComponentProps, ReactNode } from 'react'

import { cn } from 'cn'

import { Button } from './ui/button'

export function WarmGlow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-0 h-52 w-80 bg-[radial-gradient(ellipse_at_center,rgba(255,137,6,0.18),transparent_65%)]"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function Screen({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('screen-in mx-auto flex w-full max-w-6xl flex-col px-6 py-8 sm:px-8 md:px-12 lg:px-16', className)}>
      {children}
    </section>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mb-2 text-xs font-extrabold tracking-[0.06em] text-primary', className)}>{children}</p>
}

const cta = 'h-auto w-full max-w-md rounded-2xl px-5 py-4 text-base font-bold active:scale-[0.97]'

export function PrimaryButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(cta, 'shadow-[0_8px_24px_-10px_rgba(255,137,6,0.55)]', className)}
      {...props}
    />
  )
}

export function GhostButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      className={cn(cta, 'font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground', className)}
      {...props}
    />
  )
}

export function OutlineButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(cta, 'border-border bg-transparent text-foreground hover:bg-card', className)}
      {...props}
    />
  )
}
