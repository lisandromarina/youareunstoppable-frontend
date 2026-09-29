import { Navigate, useNavigate } from 'react-router'

import { PrimaryButton, Screen } from '../components/look'
import { useRecord } from '../data/record'

export function DayComplete() {
  const navigate = useNavigate()
  const ceremony = useRecord((state) => state.ceremony)
  const clearCeremony = useRecord((state) => state.clearCeremony)

  if (!ceremony) return <Navigate to="/today" replace />

  return (
    <Screen className="min-h-svh max-w-lg! items-center justify-center text-center">
      <div className="max-w-sm">
        <h1 className="text-[42px] leading-[1.05] font-extrabold tracking-tight">
          Today, you are the person you want to become.
        </h1>
        <p className="mt-6 text-[18px] leading-relaxed text-muted-foreground">
          Come back tomorrow. More activities will be here, on the way to that person.
        </p>
      </div>
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
    </Screen>
  )
}
