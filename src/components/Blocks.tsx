import { cn } from 'cn'

import type { YearDay } from '../api/record'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const fills = ['bg-empty', 'bg-primary/40', 'bg-primary']

function fill(level: number) {
  return fills[Math.min(fills.length - 1, Math.max(0, level))]
}

export function PhaseSquares({
  levels,
  current,
}: {
  levels: number[]
  current: number
}) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-hidden>
      {levels.map((level, index) => (
        <span
          key={index}
          className={cn(
            'size-3.5 rounded-[3px]',
            fill(level),
            index === current && 'ring-2 ring-primary/70 ring-offset-2 ring-offset-background',
          )}
        />
      ))}
    </div>
  )
}

function yearFill(level: number) {
  if (level <= 0) return 'bg-white/10'
  if (level === 1) return 'bg-primary/45'
  return 'bg-primary'
}

export function YearGrid({ days }: { days: YearDay[] }) {
  const year = days[0]?.date.slice(0, 4) ?? ''

  return (
    <div>
      <p className="text-[32px] leading-none font-extrabold tracking-tight">{year}</p>
      <div className="mt-4 flex justify-between text-[10px] font-medium tracking-wide text-white/40">
        {MONTHS.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      <div
        className="mt-2 grid w-full grid-flow-col grid-rows-7 gap-[2px]"
        style={{ gridAutoColumns: 'minmax(0, 1fr)' }}
        aria-label={`${year} year`}
      >
        {days.map((day) => (
          <span
            key={day.date}
            title={day.date}
            className={cn(
              'aspect-square w-full rounded-[1px]',
              yearFill(day.intensity),
              day.today && 'outline outline-1 -outline-offset-1 outline-white/80',
            )}
          />
        ))}
      </div>
    </div>
  )
}
