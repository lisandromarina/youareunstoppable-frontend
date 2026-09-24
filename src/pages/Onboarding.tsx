import { Link } from 'react-router'

import { Eyebrow, GhostButton, PrimaryButton, Screen } from '../components/look'
import { useSession } from '../session/store'

export function Onboarding() {
  const closedMessage = useSession((state) => state.closedMessage)

  return (
    <Screen className="min-h-svh items-center justify-center">
      <div className="w-full max-w-md">
        <Eyebrow>YouAreUnstoppable</Eyebrow>
        <h1 className="text-[33px] leading-[1.14] font-extrabold tracking-tight">
          You know you can
          <br />
          become more.
        </h1>
        <p className="mt-3 max-w-[36ch] text-[15.5px] leading-normal text-muted-foreground">
          The problem isn't knowing what you should do.
          <br />
          It's showing up consistently.
        </p>
        <div className="mt-10 flex flex-col gap-2">
          {closedMessage ? (
            <p className="mb-2 text-sm font-semibold text-primary" role="alert">
              {closedMessage}
            </p>
          ) : null}
          <PrimaryButton asChild>
            <Link to="/register">Start my transformation →</Link>
          </PrimaryButton>
          <GhostButton asChild>
            <Link to="/sign-in">I already have an account</Link>
          </GhostButton>
        </div>
      </div>
    </Screen>
  )
}
