import { Navigate } from 'react-router'

import { cn } from 'cn'
import { PhaseSquares } from '../components/Blocks'
import { PremiumSoon } from '../components/PremiumSoon'
import { Screen } from '../components/look'
import { phaseCursor, phaseLevels, phaseMoment, useRecord } from '../data/record'

export function Journey() {
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record) return null

  return (
    <Screen className="max-w-lg! pb-28 md:pb-12">
      <h1 className="text-[28px] leading-snug font-extrabold">{record.statement}</h1>

      <div className="mt-10 flex flex-col gap-12">
        {record.selections.map((selection) => {
          const moment = phaseMoment(selection, record.today.closed)
          return (
            <section key={selection.identity_id}>
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">
                {selection.identity_name.toUpperCase()}
              </p>
              <ol className="mt-4">
                {selection.phases.map((phase, index) => (
                  <li key={phase.name} className="flex gap-3">
                    <span className="flex flex-col items-center">
                      <span
                        className={cn(
                          'mt-1.5 size-2.5 rounded-full',
                          phase.status === 'upcoming' ? 'bg-white/15' : 'bg-primary',
                          phase.status === 'current' && 'ring-4 ring-primary/25',
                        )}
                      />
                      {index < selection.phases.length - 1 ? (
                        <span className="my-1 h-6 w-px bg-white/10" />
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        'pb-3 text-[16px] font-semibold',
                        phase.status === 'upcoming' && 'text-white/35',
                        phase.status === 'current' && 'text-primary',
                      )}
                    >
                      {phase.name}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-4">
                <PhaseSquares
                  levels={phaseLevels(record.year, selection, record.today.closed)}
                  current={phaseCursor(selection, record.today.closed)}
                />
                <p className="mt-3 text-sm text-muted-foreground">Day {moment.day}</p>
                <p className="text-sm text-muted-foreground">About {moment.length} days</p>
              </div>
            </section>
          )
        })}
      </div>

      <PremiumSoon />
    </Screen>
  )
}
