import type { Metadata, Viewport } from 'next'
import { parse } from 'valibot'
import { prisma } from '@/core/db'
import {
  invitationGalleriesType,
  invitationSettingsType,
} from '@/feat/invitation/schema'
import { Config } from '@/core/config'
import InvitationPublicPage from '@/feat/invitation/pages/public/server'

export const viewport: Viewport = {
  themeColor: 'black',
}

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(arg: Props): Promise<Metadata> {
  const { id } = await arg.params
  const args = id?.split('-')

  const defaultMetadata = {
    title: 'Undangan | RFZ',
    description: 'Undangan elegan yang paling mudah dan intuitif.',
  }

  if (!id || !args?.length || args.length > 2) {
    return defaultMetadata
  }

  try {
    const [id] = args
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: { settings: true, galleries: true },
    })

    if (!invitation) {
      return defaultMetadata
    }

    const { meta } = parse(invitationSettingsType, invitation.settings)
    const galleries = parse(invitationGalleriesType, invitation.galleries)
    const metaImage = galleries.find(
      (item) => item.role === Config.GalleryType.InvitationMeta
    )?.url

    return {
      ...defaultMetadata,
      title: `${meta.title} | RFZ`,
      description: meta.description,
      openGraph: metaImage
        ? {
            images: [metaImage],
          }
        : void 0,
    }
  } catch (e) {
    return defaultMetadata
  }
}

export default InvitationPublicPage
