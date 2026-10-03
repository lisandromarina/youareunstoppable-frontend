import { useEffect, useRef } from 'react'

import { cn } from 'cn'

import type { YearDay } from '../api/record'
import { shownIntensity } from '../data/record'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const fills = ['bg-empty', 'bg-primary/55', 'bg-primary']

function fill(level: number) {
  return fills[Math.min(fills.length - 1, Math.max(0, level))]
}

export function PhaseSquares({
  levels,
  current,
  animateIndex = -1,
}: {
  levels: number[]
  current: number
  animateIndex?: number
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden>
      {levels.map((level, index) => (
        <span
          key={index}
          className={cn(
            'size-7 rounded-md',
            fill(level),
            index === current && 'day-current',
            index === animateIndex && 'block-in',
          )}
        />
      ))}
    </div>
  )
}

function yearFill(level: number) {
  if (level <= 0) return 'bg-empty'
  if (level === 1) return 'bg-primary/55'
  return 'bg-primary shadow-[0_0_8px_rgba(255,137,6,0.35)]'
}

function mondayOffset(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const sundayFirst = new Date(year, month - 1, day).getDay()
  return (sundayFirst + 6) % 7
}

type YearCell = { key: string; day?: YearDay }

function weekCells(days: YearDay[]): YearCell[] {
  if (days.length === 0) return []
  const lead = mondayOffset(days[0].date)
  const cells: YearCell[] = Array.from({ length: lead }, (_, index) => ({ key: `lead-${index}` }))
  for (const day of days) cells.push({ key: day.date, day })
  const tail = (7 - (cells.length % 7)) % 7
  for (let index = 0; index < tail; index += 1) cells.push({ key: `tail-${index}` })
  return cells
}

function monthLabels(days: YearDay[], columns: number, lead: number) {
  const labels = Array<string | null>(columns).fill(null)
  days.forEach((day, index) => {
    if (day.date.slice(8, 10) !== '01') return
    const column = Math.floor((lead + index) / 7)
    const month = Number(day.date.slice(5, 7)) - 1
    if (column >= 0 && column < columns) labels[column] = MONTHS[month] ?? null
  })
  return labels
}

export function YearGrid({ days }: { days: YearDay[] }) {
  const year = days[0]?.date.slice(0, 4) ?? ''
  const cells = weekCells(days)
  const columns = Math.max(1, cells.length / 7)
  const cell = 11
  const gap = 3
  const width = columns * cell + (columns - 1) * gap
  const labels = monthLabels(days, columns, days[0] ? mondayOffset(days[0].date) : 0)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = scroller.current
    const today = root?.querySelector<HTMLElement>('[data-today="true"]')
    if (!root || !today) return
    const rootBox = root.getBoundingClientRect()
    const todayBox = today.getBoundingClientRect()
    root.scrollLeft = Math.max(0, root.scrollLeft + todayBox.left - rootBox.left - root.clientWidth / 2 + todayBox.width / 2)
  }, [days])

  return (
    <div>
      <p className="text-sm font-semibold tracking-wide text-muted-foreground">{year}</p>
      <div ref={scroller} className="year-scroll mt-4 overflow-x-auto pb-1">
        <div style={{ width }}>
          <div
            className="grid text-[10px] font-medium tracking-wide text-white/40"
            style={{ gridTemplateColumns: `repeat(${columns}, ${cell}px)`, columnGap: gap }}
          >
            {labels.map((month, index) => (
              <span key={index} className="col-auto whitespace-nowrap">
                {month ?? ''}
              </span>
            ))}
          </div>
          <div
            className="mt-2 grid grid-flow-col grid-rows-7"
            style={{ gridAutoColumns: `${cell}px`, gap, width }}
            aria-label={`${year} year, weeks starting Monday`}
          >
            {cells.map((item) =>
              item.day ? (
                <span
                  key={item.key}
                  title={item.day.date}
                  data-today={item.day.today ? 'true' : undefined}
                  className={cn(
                    'size-[11px] rounded-[3px]',
                    yearFill(shownIntensity(item.day.intensity, item.day.closed)),
                    item.day.today && 'outline outline-1 -outline-offset-1 outline-primary/80',
                  )}
                />
              ) : (
                <span key={item.key} className="size-[11px]" aria-hidden />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
