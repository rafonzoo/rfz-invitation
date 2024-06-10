import { signIn } from '@app/auth'

const FormProvider: RF<{ provider: 'google' | 'github' }> = ({ provider }) => {
  async function signInWithProvider() {
    'use server'

    await signIn(provider, { redirectTo: '/undangan/semua' })
  }

  return (
    <form action={signInWithProvider}>
      <button type='submit'>Sign in with {provider}</button>
    </form>
  )
}

export default FormProvider
