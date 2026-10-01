import { Link } from 'react-router'

import { PrimaryButton, Screen } from '../components/look'

export function Invite() {
  return (
    <Screen className="min-h-svh max-w-lg! items-center text-center">
      <p className="mt-[8vh] text-[12px] font-extrabold tracking-[0.18em] text-muted-foreground">
        YouAreUnstoppable
      </p>
      <div className="mt-[12vh] flex w-full max-w-sm flex-col items-center">
        <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-tight">
          Who are you becoming?
        </h1>
        <p className="mt-5 max-w-xs text-[17px] leading-relaxed text-muted-foreground">
          Your next chapter starts with what you do today.
        </p>
        <PrimaryButton className="mt-10" asChild>
          <Link to="/register">Begin</Link>
        </PrimaryButton>
      </div>
      <div className="mt-auto flex w-full max-w-xs flex-col items-center pb-4">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Every day you show up, you add another block to the person you're becoming.
        </p>
        <p className="mt-8 text-[13px] text-muted-foreground">Already a member?</p>
        <Link to="/sign-in" className="mt-1 text-[15px] font-semibold text-primary">
          Sign in
        </Link>
      </div>
    </Screen>
  )
}
