import { useNavigate } from 'react-router'

import { PrimaryButton, Screen } from '../components/look'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useIdentity } from '../data/identity'

export function FutureSelf() {
  const navigate = useNavigate()
  const futureSelf = useIdentity((state) => state.futureSelf)
  const setFutureSelf = useIdentity((state) => state.setFutureSelf)

  return (
    <Screen className="min-h-svh">
      <h1 className="max-w-xl text-[25px] leading-tight font-extrabold">
        Describe the person you're becoming.
      </h1>
      <Label htmlFor="future-self" className="sr-only">
        Future self
      </Label>
      <Textarea
        id="future-self"
        className="mt-5 min-h-40 rounded-2xl bg-card px-4 py-4 text-[15.5px] leading-normal md:min-h-56"
        value={futureSelf}
        placeholder="I want to become someone who…"
        onChange={(event) => setFutureSelf(event.target.value)}
      />
      <PrimaryButton
        className="mt-10"
        type="button"
        onClick={() => {
          if (!futureSelf.trim()) {
            setFutureSelf(
              "I want to become disciplined, physically strong, financially independent and confident. I want to stop procrastinating and start doing what I know I'm capable of.",
            )
          }
          navigate('/transformation')
        }}
      >
        Create my transformation →
      </PrimaryButton>
    </Screen>
  )
}
