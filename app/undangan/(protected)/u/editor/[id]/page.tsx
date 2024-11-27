import type { Metadata, Viewport } from 'next'
import { prisma } from '@/core/db'
import { capitalUnstrip, formattedSlug } from '@/feat/invitation/helpers'
import InvitationPageEditor from '@/feat/invitation/pages/editor/server'

export const viewport: Viewport = {
  themeColor: 'black',
}

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(arg: Props): Promise<Metadata> {
  const { id } = await arg.params
  const defaultMetadata = {
    title: 'Undangan | RFZ',
    description:
      'Undangan elegan yang paling mudah dan intuitif untuk berbagai kebutuhan.',
  }

  if (!id) {
    return defaultMetadata
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: { slug: true, type: true },
  })

  if (!invitation) {
    return defaultMetadata
  }

  const slug = formattedSlug(invitation.slug)
  const type = capitalUnstrip(invitation.type)

  return {
    ...defaultMetadata,
    title: `${slug} | ${type}`,
  }
}

export default InvitationPageEditor
