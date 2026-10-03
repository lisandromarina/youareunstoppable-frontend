import { Navigate, useNavigate } from 'react-router'

import { TomorrowList } from '../components/TomorrowList'
import { PrimaryButton, Screen, WarmGlow } from '../components/look'
import { continueBecoming, shiftsFor, useRecord, type PhaseShift } from '../data/record'

export function DayComplete() {
  const navigate = useNavigate()
  const record = useRecord((state) => state.record)
  const ceremony = useRecord((state) => state.ceremony)
  const accountId = useRecord((state) => state.accountId)
  const clearCeremony = useRecord((state) => state.clearCeremony)

  if (!record) return null
  if (!record.today.closed) return <Navigate to="/today" replace />

  const shifts = ceremony?.shifts ?? shiftsFor(accountId, record.today.date)

  return (
    <Screen className="min-h-svh max-w-lg!">
      <WarmGlow>
        <div className="block-fill size-14 rounded-lg bg-empty" aria-hidden />
      </WarmGlow>
      <div className="copy-after mt-8">
      {shifts.length > 0 ? (
        <div className="flex flex-col gap-12">
          {shifts.map((shift) => (
            <PhaseMoment key={shift.identity} shift={shift} showIdentity={shifts.length > 1} />
          ))}
        </div>
      ) : (
        <div className="max-w-sm">
          <h1 className="text-[42px] leading-[1.05] font-extrabold tracking-tight">Day complete</h1>
          <p className="mt-6 text-[18px] leading-relaxed">You kept today's promises.</p>
          <p className="mt-2 text-[18px] leading-relaxed text-muted-foreground">
            {continueBecoming(record.statement)}
          </p>
        </div>
      )}
      <TomorrowList items={record.tomorrow} showIdentity={record.selections.length > 1} />
      <PrimaryButton
        className="mt-10"
        type="button"
        onClick={() => {
          clearCeremony()
          navigate('/today')
        }}
      >
        Done for today
      </PrimaryButton>
      </div>
    </Screen>
  )
}

function PhaseMoment({ shift, showIdentity }: { shift: PhaseShift; showIdentity: boolean }) {
  return (
    <section className="max-w-sm">
      {showIdentity ? (
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">
          {shift.identity.toUpperCase()}
        </p>
      ) : null}
      <h1 className="text-[42px] leading-[1.05] font-extrabold tracking-tight">
        {shift.finishedName} complete.
      </h1>
      <p className="mt-6 text-[18px] leading-relaxed">
        {shift.length} {shift.length === 1 ? 'day' : 'days'} of {shift.finishedHeadline}.
      </p>
      <p className="mt-2 text-[18px] leading-relaxed text-muted-foreground">You don't need to start over.</p>
      {shift.nextName ? (
        <>
          <p className="text-[18px] leading-relaxed text-muted-foreground">You move forward.</p>
          <p className="mt-8 text-[11px] font-extrabold tracking-[0.14em] text-primary">Next phase</p>
          <p className="mt-2 text-[26px] font-extrabold">{shift.nextName}</p>
          {shift.nextHeadline && shift.nextHeadline !== shift.nextName ? (
            <p className="mt-1 text-[16px] text-muted-foreground">{shift.nextHeadline}</p>
          ) : null}
        </>
      ) : (
        <p className="text-[18px] leading-relaxed text-muted-foreground">Tomorrow keeps the same promises.</p>
      )}
    </section>
  )
}
