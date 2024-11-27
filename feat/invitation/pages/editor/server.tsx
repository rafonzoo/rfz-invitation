import type { InvitationDetail } from '@/feat/invitation/schema'
import { notFound, redirect } from 'next/navigation'
import { Ellipsis, Share } from 'lucide-react'
import { prisma } from '@/core/db'
import { Config, Routes } from '@/core/config'
import { getCheckUser } from '@/feat/auth/action'
import ButtonIcon from '@/components/button/icon'
import InvitationResponseSection from '@/feat/invitation/components/response'
import InvitationEditorChapter from '@/feat/invitation/pages/editor/chapter'
import InvitationEditorKeyEvent from '@/feat/invitation/pages/editor/key-event'
import InvitationEditorLanding from '@/feat/invitation/pages/editor/landing'
import InvitationEditorGalleries from '@/feat/invitation/pages/editor/galleries'
import InvitationEditorGuest from '@/feat/invitation/pages/editor/guest'
import InvitationEditorMore from '@/feat/invitation/pages/editor/more'
import DayJS from '@/lib/dayjs'

type Params = {
  params: {
    id?: string
  }
}

const HERO = Config.GalleryType.InvitationHero
const META = Config.GalleryType.InvitationMeta
const MUSIC = Config.GalleryType.InvitationMusic

export default async function InvitationPageEditor(arg: Params) {
  const { email } = await getCheckUser()
  const invitationId = arg.params.id

  if (!invitationId) {
    return notFound()
  }

  const _invitation = await prisma.invitation.findUnique({
    where: { id: invitationId, email },
  })

  if (!_invitation) {
    return notFound()
  }

  // prettier-ignore
  const {
    id,
    type,
    name,
    tier,
    slug,
    galleries,
    keys,
    guests,
    pending,
    events,
    gift,
    settings,
    expiredAt,
    responses,
  } = _invitation as InvitationDetail
  const { meta } = settings
  const isExpired = DayJS().tz().isAfter(DayJS(expiredAt).tz(), 'date')
  const publicUrl = [Routes.invitationPublic, id].join('/')

  if (isExpired) {
    return redirect(publicUrl)
  }

  return (
    <>
      <InvitationEditorChapter {...{ type, slug }}>
        <InvitationEditorMore
          {...{ id, type, tier, slug, gift, guests, responses }}
          isPending={pending}
          music={galleries.find((item) => item.role === MUSIC)}
        >
          <ButtonIcon aria-label='Selengkapnya' className='bg-zinc-700 p-1.5'>
            <Ellipsis size={16} />
          </ButtonIcon>
        </InvitationEditorMore>
        <InvitationEditorGuest
          {...{ id, tier, guests, meta }}
          metaImage={galleries.find((item) => item.role === META)}
        >
          <ButtonIcon
            aria-label='Bagikan'
            className='ml-1.5 block bg-zinc-700 p-1.5'
          >
            <Share size={16} />
          </ButtonIcon>
        </InvitationEditorGuest>
      </InvitationEditorChapter>
      <InvitationEditorLanding
        {...{ id, type, tier, name }}
        gallery={galleries.find((item) => item.role === HERO)}
        landing={settings.landing}
      />
      <InvitationEditorKeyEvent {...{ id, keys, events }} />
      <InvitationEditorGalleries {...{ id, tier, galleries }} />
      <InvitationResponseSection {...{ type, gift, responses }} hasSession />
    </>
  )
}
