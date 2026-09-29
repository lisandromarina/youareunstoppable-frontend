import { Navigate } from 'react-router'

import { YearGrid } from '../components/Blocks'
import { PremiumSoon } from '../components/PremiumSoon'
import { Screen } from '../components/look'
import { phaseMoment, useRecord } from '../data/record'

export function Progress() {
  const status = useRecord((state) => state.status)
  const record = useRecord((state) => state.record)

  if (status === 'empty') return <Navigate to="/begin" replace />
  if (!record) return null

  const { progress } = record
  const primary = record.selections[0]
  const moment = primary ? phaseMoment(primary, record.today.closed) : null
  const width = moment ? Math.min(100, (moment.day / moment.length) * 100) : 0
  const next =
    moment && moment.phase !== progress.phase_name ? progress.phase_name : progress.next_phase_name

  return (
    <Screen className="max-w-lg! pb-28 md:pb-12">
      <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Current phase</p>
      <p className="mt-2 text-[26px] font-extrabold">{moment?.phase ?? progress.phase_name}</p>
      <p className="mt-8 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Progress</p>
      <p className="mt-2 text-[22px] font-extrabold">Day {moment?.day ?? progress.day_in_phase}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        About {moment?.length ?? progress.length_days} days
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-empty">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-8 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">
        Days you kept promises to yourself
      </p>
      <p className="mt-2 text-[22px] font-extrabold">{record.promises_kept}</p>
      <p className="mt-8 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Commitments</p>
      <p className="mt-2 text-[22px] font-extrabold">
        {progress.commitments_done} / {progress.commitments_total} completed
      </p>
      {next ? (
        <>
          <p className="mt-8 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Next phase</p>
          <p className="mt-2 text-[22px] font-extrabold">{next}</p>
        </>
      ) : null}
      <div className="mt-14">
        <YearGrid days={record.year} />
      </div>
      <PremiumSoon />
    </Screen>
  )
}
