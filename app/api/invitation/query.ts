// import type { Invitation } from '@prisma/client'
// import { fetchRequest } from '@app/server/helpers'
// import { notFound, redirect } from 'next/navigation'

// export async function getInvitation(hash: string) {
//   const url = `/api/invitation?hash=${hash}`
//   const invitation = await fetchRequest<Invitation>(url, {
//     throws: [
//       [401, () => redirect('/akun/masuk')],
//       [500, () => notFound()],
//     ],
//   })

//   return invitation
// }
