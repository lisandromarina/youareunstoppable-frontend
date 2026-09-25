import { CredentialScreen } from './CredentialScreen'
import { useSession } from '../session/store'

export function Register() {
  const register = useSession((state) => state.register)

  return (
    <CredentialScreen
      eyebrow="Create account"
      title="Start my transformation."
      lede="A new account. Then you choose who you're becoming."
      submitLabel="Create account"
      passwordAutoComplete="new-password"
      passwordHint="At least 8 characters."
      minPassword={8}
      googleLabel="Sign up with Google"
      googleText="signup_with"
      alternate={{ to: '/', label: 'I already have an account' }}
      next="/becoming"
      onSubmit={register}
    />
  )
}
