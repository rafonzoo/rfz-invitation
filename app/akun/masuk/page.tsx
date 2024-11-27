import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Routes } from '@/core/config'
import ButtonAuth from '@/components/button/auth'

type SigninProps = {
  searchParams: {
    error: 'OAuthCallbackError'
  }
}

export default async function Signin(props: SigninProps) {
  const session = await auth()
  const isProviderError = props.searchParams.error === 'OAuthCallbackError'

  if (session) {
    redirect(Routes.invitationKoleksi)
  }

  return (
    <main>
      {props.searchParams.error && (
        <p className='mb-3 text-red-600'>
          {isProviderError ? (
            <>Silahkan gunakan provider lain atau coba beberapa saat lagi</>
          ) : (
            <>Gagal melakukan autentikasi. Coba beberapa saat lagi</>
          )}
        </p>
      )}
      <ButtonAuth provider='google'>Sign in with google</ButtonAuth>
      <ButtonAuth provider='github'>Sign in with github</ButtonAuth>
    </main>
  )
}
