import type { InvitationDetail } from '@/feat/invitation/schema'
import { notFound } from 'next/navigation'
import { prisma } from '@/core/db'
import { Config } from '@/core/config'
import { auth } from '@/auth'
import InvitationResponseSection from '@/feat/invitation/components/response'
import InvitationEventSection from '@/feat/invitation/components/events'
import InvitationGallerySection from '@/feat/invitation/components/galleries'
import InvitationKeySection from '@/feat/invitation/components/keys'
import InvitationLandingSection from '@/feat/invitation/components/landing'
import InvitationMusic from '@/feat/invitation/components/music'
import DayJS from '@/lib/dayjs'

const HERO = Config.GalleryType.InvitationHero
const MUSIC = Config.GalleryType.InvitationMusic

type Params = {
  params: Promise<{
    id?: string
  }>
}

export default async function InvitationPublicPage(arg: Params) {
  const { id: _id } = await arg.params
  const invitationId = _id?.split('-')
  const session = await auth()
  const enableAnimation = true

  let _invitation
  let guests: InvitationDetail['guests'] | undefined

  if (!invitationId?.length || invitationId.length > 2) {
    return notFound()
  }

  const [id, guestId] = invitationId

  try {
    if (!session?.user?.email) {
      _invitation = await prisma.invitation.findUniqueOrThrow({
        where: { id },
      })

      if (!guestId || !_invitation) {
        return notFound()
      }

      const invitation = _invitation as InvitationDetail
      guests = invitation.guests

      if (!guests.find((guest) => guest.id === guestId)) {
        return notFound()
      }
    } else {
      _invitation = await prisma.invitation.findUniqueOrThrow({
        where: { id, email: session.user.email },
      })

      const detail = _invitation as InvitationDetail
      if (guestId && !detail.guests.find(({ id: gid }) => gid === guestId)) {
        return notFound()
      }
    }
  } catch (e) {
    return notFound()
  }

  // prettier-ignore
  const {
    type,
    name,
    galleries,
    gift,
    keys,
    events,
    slug,
    settings,
    responses,
    expiredAt,
    ...invitation
  } = _invitation as InvitationDetail
  const isExpired = DayJS().tz().isAfter(DayJS(expiredAt).tz(), 'date')

  if (isExpired && !session) {
    return notFound()
  }

  return (
    <>
      <InvitationMusic
        url={galleries.find((item) => item.role === MUSIC)?.url}
      />
      <InvitationLandingSection
        {...{ type, name, enableAnimation, landing: settings.landing }}
        gallery={galleries.find((item) => item.role === HERO)}
        guestName={
          invitation.guests.find((guest) => guest.id === guestId)?.name
        }
      />
      <InvitationKeySection {...{ enableAnimation, keys }} />
      <InvitationEventSection {...{ enableAnimation, events }} />
      <InvitationGallerySection {...{ enableAnimation, galleries }} />
      <InvitationResponseSection
        {...{ type, gift, responses }}
        hasSession={!!session}
        isSpecialGuest={
          invitation.guests.find((guest) => guest.id === guestId)?.role ===
          'vip'
        }
      />
    </>
  )
}
