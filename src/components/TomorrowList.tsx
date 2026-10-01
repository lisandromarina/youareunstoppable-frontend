import type { TomorrowItem } from '../api/record'

export function TomorrowList({
  items,
  showIdentity,
}: {
  items?: TomorrowItem[]
  showIdentity: boolean
}) {
  if (!items) return null
  return (
    <div className="mt-10 w-full text-left">
      <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Tomorrow</p>
      {items.length === 0 ? (
        <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
          Nothing is due. Your path is still here.
        </p>
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
