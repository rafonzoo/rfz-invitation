import Link from 'next/link'

export default async function Home() {
  return (
    <main>
      <h1 className='sr-only'>Homepage</h1>
      <p className='text-3xl font-bold'>Homepage</p>
      <br />
      <br />
      <p>
        {/* <Link prefetch={false} href='/undangan/claire-leon-x3dv2a?to=Rafa'> */}
        <Link prefetch={false} href='/undangan/semua'>
          test detail invitation
        </Link>
      </p>
      <p>
        <Link prefetch={false} href='/akun/masuk'>
          sign in
        </Link>
      </p>
    </main>
  )
}
