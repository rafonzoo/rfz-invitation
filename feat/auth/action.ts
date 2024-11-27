'use server'

import type { OAuthProviderType } from 'next-auth/providers'
import type { User } from 'next-auth'
import { redirect } from 'next/navigation'
import { auth, signIn, signOut } from '@/auth'
import { Routes } from '@/core/config'

export async function getCheckUser() {
  const session = await auth()

  if (!session || !session.user || !session.user.email) {
    return redirect(Routes.authSignin)
  }

  return session.user as Omit<User, 'email'> & { email: string }
}

export async function authProviderStateChange(formData: FormData) {
  const provider = formData.get('provider') as OAuthProviderType | undefined

  if (!provider) {
    await signOut()
    return
  }

  await signIn(provider, { redirectTo: Routes.invitationKoleksi })
}
