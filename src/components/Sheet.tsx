import type { ReactNode } from 'react'

export function Sheet({
  open,
  title,
  lede,
  onClose,
  children,
}: {
  open: boolean
  title: string
  lede?: string
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <button
        type="button"
        className="backdrop-in absolute inset-0 bg-black/55"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="sheet-up relative z-10 w-full max-w-lg rounded-t-3xl bg-[#17151f] px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-left shadow-[0_-20px_60px_rgba(0,0,0,0.35)]"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />
        <h2 id="sheet-title" className="text-xl font-extrabold">
          {title}
        </h2>
        {lede ? <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{lede}</p> : null}
        <div className="mt-5 flex flex-col">{children}</div>
      </div>
    </div>
  )
}

export function SheetChoice({
  label,
  detail,
  selected,
  onClick,
}: {
  label: string
  detail?: string
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b border-white/8 py-4 text-left last:border-b-0 ${selected ? 'text-primary' : ''}`}
    >
      <span className="block text-[16px] font-semibold">{label}</span>
      {detail ? <span className="mt-1 block text-sm text-muted-foreground">{detail}</span> : null}
    </button>
  )
}
