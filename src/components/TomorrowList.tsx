import type { TomorrowItem } from '../api/record'

export function tomorrowLabel(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, (day ?? 1) + 1)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  return `TOMORROW · ${weekday}`
}

function groupsOf(items: TomorrowItem[]) {
  const names: string[] = []
  const grouped = new Map<string, TomorrowItem[]>()
  for (const item of items) {
    const list = grouped.get(item.identity_name)
    if (list) list.push(item)
    else {
      names.push(item.identity_name)
      grouped.set(item.identity_name, [item])
    }
  }
  return names.map((name) => ({ name, items: grouped.get(name) ?? [] }))
}

export function TomorrowList({
  items,
  heading = 'TOMORROW',
}: {
  items?: TomorrowItem[]
  heading?: string
}) {
  if (!items) return null
  const groups = groupsOf(items)
  return (
    <section className="mt-10 w-full text-left">
      <p className="text-[11px] font-extrabold tracking-[0.16em] text-muted-foreground">{heading}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-[15px] text-muted-foreground">Nothing is due. Your path is still here.</p>
      ) : (
        groups.map((group) => (
          <div key={group.name} className="mt-5">
            <h3 className="text-[13px] font-extrabold tracking-[0.14em] text-primary">{group.name.toUpperCase()}</h3>
            <ul className="mt-1">
              {group.items.map((item) => (
                <li
                  key={`${item.identity_name}-${item.title}`}
                  className="flex items-center gap-3 border-b border-white/8 py-3"
                >
                  <span className="size-6 shrink-0 rounded-full border border-white/25" aria-hidden />
                  <span className="min-w-0 flex-1 text-[16px] font-semibold">{item.title}</span>
                  <span className="shrink-0 text-[13px] text-muted-foreground">{item.cadence}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
