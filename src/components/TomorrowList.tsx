import type { TomorrowItem } from '../api/record'

export function TomorrowList({
  items,
  showIdentity,
  cards = false,
  aside,
}: {
  items?: TomorrowItem[]
  showIdentity: boolean
  cards?: boolean
  aside?: string
}) {
  if (!items) return null
  if (cards && items.length === 0) return null
  return (
    <div className="mt-10 w-full max-w-2xl text-left">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">TOMORROW</p>
        {aside ? <p className="text-[13px] text-muted-foreground">{aside}</p> : null}
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
          Nothing is due. Your path is still here.
        </p>
      ) : cards ? (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={`${item.identity_name}-${item.title}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card px-4 py-3.5"
            >
              <span className="min-w-0">
                {showIdentity ? (
                  <span className="mb-1 block text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground">
                    {item.identity_name.toUpperCase()}
                  </span>
                ) : null}
                <span className="block text-[16px] font-semibold">{item.title}</span>
              </span>
              <span className="shrink-0 text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground">
                {item.cadence.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-2">
          {items.map((item) => (
            <li key={`${item.identity_name}-${item.title}`} className="border-b border-white/8 py-3">
              <span className="block text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground">
                {showIdentity ? `${item.identity_name.toUpperCase()} · ` : ''}
                {item.cadence.toUpperCase()}
              </span>
              <span className="mt-1 block text-[16px] font-semibold">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
