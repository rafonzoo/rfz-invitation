import { auth } from '@app/auth'
import { redirect } from 'next/navigation'
import FormProvider from './partials/FormProvider'

type SigninProps = {
  searchParams: {
    error: 'OAuthCallbackError'
  }
}

export default async function Signin(props: SigninProps) {
  const session = await auth()
  const isProviderError = props.searchParams.error === 'OAuthCallbackError'

  if (session) {
    return redirect('/undangan/semua')
  }

  return (
    <main>
      {isProviderError && (
        <p className='mb-3 text-red-600'>
          Silahkan gunakan provider lain atau coba lagi.
        </p>
      )}
      <FormProvider provider='google' />
      <FormProvider provider='github' />
    </main>
  )
}
