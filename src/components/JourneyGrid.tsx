import { TODAY_INDEX, TOTAL_DAYS, useDay } from '../data/day'

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export function JourneyGrid() {
  const grid = useDay((state) => state.grid)
  const openDay = useDay((state) => state.openDay)
  const columns: { name: string; weeks: number[][] }[] = []
  let day = 0

  for (let month = 0; month < 13 && day < TOTAL_DAYS; month += 1) {
    const weeks: number[][] = []
    for (let week = 0; week < 5 && day < TOTAL_DAYS; week += 1) {
      const cells: number[] = []
      for (let slot = 0; slot < 7 && day < TOTAL_DAYS; slot += 1) {
        cells.push(day)
        day += 1
      }
      weeks.push(cells)
    }
    columns.push({
      name: months[(2 + month) % 12],
      weeks,
    })
  }

  return (
    <div className="-mx-6 overflow-x-auto px-6 pb-1 sm:-mx-8 sm:px-8">
      <div className="flex w-max gap-[3px]">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-[3px]">
            <p className="mb-1 h-3 text-[10px] font-bold text-muted-foreground">{column.name}</p>
            <div className="flex gap-[3px]">
              {column.weeks.map((week) => (
                <div key={week[0]} className="flex flex-col gap-[3px]">
                  {week.map((index) => {
                    const level = grid[index] ?? 0
                    return (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Day ${index + 1}`}
                        onClick={() => openDay(index)}
                        className={[
                          'size-[11px] rounded-[3px] md:size-3.5',
                          level === 0 ? 'bg-empty' : '',
                          level === 1 ? 'bg-accent-soft' : '',
                          level === 2 ? 'bg-primary/75' : '',
                          level === 3 ? 'bg-primary shadow-[0_0_6px_rgba(255,137,6,0.6)]' : '',
                          index === TODAY_INDEX ? 'outline outline-2 outline-offset-1 outline-foreground' : '',
                        ].join(' ')}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
