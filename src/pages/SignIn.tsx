import { CredentialScreen } from './CredentialScreen'
import { useSession } from '../session/store'

export function SignIn() {
  const login = useSession((state) => state.login)

  return (
    <CredentialScreen
      title="Show up."
      submitLabel="Sign in"
      passwordAutoComplete="current-password"
      minPassword={1}
      alternate={{ to: '/register', label: 'Start my transformation' }}
      next="/today"
      onSubmit={login}
    />
  )
}
