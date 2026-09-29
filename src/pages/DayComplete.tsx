import { Navigate, useNavigate } from 'react-router'

import { PhaseSquares } from '../components/Blocks'
import { PrimaryButton, Screen } from '../components/look'
import { phaseLevels, useRecord } from '../data/record'

export function DayComplete() {
  const navigate = useNavigate()
  const ceremony = useRecord((state) => state.ceremony)
  const record = useRecord((state) => state.record)
  const clearCeremony = useRecord((state) => state.clearCeremony)

  if (!ceremony) return <Navigate to="/today" replace />
  const primary = record?.selections[0]
  const levels = primary
    ? phaseLevels(record.year, primary, record.today.closed)
    : Array.from({ length: ceremony.length }, () => 0)

  return (
    <Screen className="min-h-svh max-w-lg! items-center justify-center text-center">
      <div className="block-in size-36 rounded-[28px] bg-primary shadow-[0_0_80px_rgba(255,137,6,0.45)]" />
      <h1 className="mt-10 text-[32px] font-extrabold">You showed up.</h1>
      <p className="mt-3 text-[17px] text-muted-foreground">Another block added.</p>
      <div className="mt-8">
        <PhaseSquares levels={levels} current={-1} />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        Day {ceremony.day}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{ceremony.phase}</p>
      <PrimaryButton
        className="mt-12"
        type="button"
        onClick={() => {
          clearCeremony()
          navigate('/today')
        }}
      >
        Keep going
      </PrimaryButton>
    </Screen>
  )
}
