import { auth, signOut } from '@app/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AllInvitation() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect('/akun/masuk')
  }

  return (
    <main>
      <h1 className='sr-only'>All Invitation</h1>
      <p>Hello {user.email}</p>
      <br />
      <br />
      <p>
        <Link prefetch={false} href='/publik'>
          Public Invitation
        </Link>
      </p>
      <form
        action={async () => {
          'use server'
          await signOut({ redirectTo: '/akun/masuk' })
        }}
      >
        <p>
          <button>Logout</button>
        </p>
      </form>
    </main>
  )
}
