import { TODAY_INDEX, useDay } from '../data/day'
import { OutlineButton } from './look'

const labels: Record<number, string> = {
  1: 'Started',
  2: 'Day complete',
  3: 'Exceptional day',
}

export function DaySheet() {
  const sheetDay = useDay((state) => state.sheetDay)
  const grid = useDay((state) => state.grid)
  const commitments = useDay((state) => state.commitments)
  const closeDay = useDay((state) => state.closeDay)

  if (sheetDay === null) return null

  const level = grid[sheetDay] ?? 0
  const label =
    sheetDay === TODAY_INDEX
      ? level >= 1
        ? 'Day complete'
        : 'In progress'
      : (labels[level] ?? 'Missed day')
  const doneCount = level >= 2 ? 4 : level === 1 ? 2 : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/55"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDay()
      }}
    >
      <div className="mx-auto w-full max-w-lg rounded-t-3xl border border-b-0 border-border bg-card px-6 pt-7 pb-8">
        <p className="mb-2 text-xs font-extrabold tracking-wide text-primary">Day {sheetDay + 1}</p>
        <h2 className="text-xl font-extrabold">{label}</h2>
        <p className="mt-1.5 text-[15.5px] text-muted-foreground">{doneCount} / 4 commitments</p>
        <ul className="mt-4">
          {commitments.map((item, index) => (
            <li
              key={item.title}
              className={`flex items-center gap-2.5 py-1.5 text-sm font-semibold ${index < doneCount ? '' : 'text-muted-foreground'}`}
            >
              <span>{index < doneCount ? '✓' : '○'}</span>
              {item.title}
            </li>
          ))}
        </ul>
        {level >= 1 ? (
          <p className="mt-3.5 text-[15.5px] text-muted-foreground italic">
            "Felt tired today but still showed up."
          </p>
        ) : null}
        <p className="mt-3.5 text-[13px] font-bold text-primary">Another vote for who you're becoming.</p>
        <OutlineButton className="mt-5 w-full" type="button" onClick={closeDay}>
          Close
        </OutlineButton>
      </div>
    </div>
  )
}
