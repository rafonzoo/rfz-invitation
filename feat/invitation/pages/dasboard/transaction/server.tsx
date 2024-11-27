import { notFound } from 'next/navigation'
import { prisma } from '@/core/db'
import { getCheckUser } from '@/feat/auth/action'
import InvitationTransactionList from '@/feat/invitation/pages/dasboard/transaction/list'

export default async function InvitationTransaction() {
  const { email } = await getCheckUser()
  const user = await prisma.user.findUnique({
    where: { email, purchases: { every: { type: 'invitation' } } },
    include: {
      purchases: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!user) return notFound()
  return <InvitationTransactionList purchases={user.purchases as any} />
}
