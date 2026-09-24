import { CredentialScreen } from './CredentialScreen'
import { useSession } from '../session/store'

export function Register() {
  const register = useSession((state) => state.register)

  return (
    <CredentialScreen
      title="Start my transformation."
      submitLabel="Start my transformation →"
      passwordAutoComplete="new-password"
      minPassword={8}
      alternate={{ to: '/sign-in', label: 'I already have an account' }}
      next="/becoming"
      onSubmit={register}
    />
  )
}
