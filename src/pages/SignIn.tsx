import { CredentialScreen } from './CredentialScreen'
import { useSession } from '../session/store'

export function SignIn() {
  const login = useSession((state) => state.login)

  return (
    <CredentialScreen
      eyebrow="Sign in"
      title="Show up."
      lede="Welcome back. Your days are waiting."
      submitLabel="Sign in"
      passwordAutoComplete="current-password"
      minPassword={1}
      googleLabel="Sign in with Google"
      googleText="signin_with"
      alternate={{ to: '/register', label: 'Create an account' }}
      next="/today"
      onSubmit={login}
    />
  )
}
