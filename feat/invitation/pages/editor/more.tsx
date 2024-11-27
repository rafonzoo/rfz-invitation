'use client'

import type { InvitationTierEnum } from '@/feat/invitation/config'
import type {
  InvitationGallery,
  InvitationGuests,
  InvitationResponses,
} from '@/feat/invitation/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  CircleFadingArrowUp,
  Fullscreen,
  ListChecks,
  Music,
  Wallet,
} from 'lucide-react'
import { serialize } from 'object-to-formdata'
import { InvitationConfig } from '@/feat/invitation/config'
import { Bucket, Config, Routes } from '@/core/config'
import { delay } from '@/core/utils'
import { updateGalleries } from '@/feat/invitation/action'
import Presentation from '@/components/presentation'
import ListItem from '@/components/list/item'
import ListGroup from '@/components/list/group'
import ButtonUpload from '@/components/upload/button'
import InvitationEditorAttendance from '@/feat/invitation/pages/editor/more/attendance'
import InvitationEditorMoreGift from '@/feat/invitation/pages/editor/more/gift'
import InvitationEditorUpgrade from '@/feat/invitation/pages/editor/upgrade'
import Toast from '@/lib/toast'

type InvitationEditorMoreProps = {
  id: string
  slug: string
  type: string
  tier: InvitationTierEnum
  isPending: boolean
  guests: InvitationGuests
  responses: InvitationResponses
  music?: Pick<InvitationGallery, 'fileId' | 'url'>
  gift: string
}

const InvitationEditorMore: RF<InvitationEditorMoreProps> = ({
  id,
  slug,
  type,
  tier,
  music,
  isPending,
  gift,
  guests,
  responses,
  children,
}) => {
  const [open, onOpenChange] = useState(false)
  const router = useRouter()

  async function updateMusic(payload: any) {
    const { errorMessage } = await updateGalleries(
      serialize({
        id,
        role: Config.GalleryType.InvitationMusic,
        ...payload,
      })
    )

    if (errorMessage) {
      return Toast.error(errorMessage)
    }
  }

  return (
    <Presentation
      title={{ children: 'Lainnya' }}
      root={{ open, onOpenChange }}
      trigger={{ asChild: true, children }}
    >
      <ListGroup info='Pratinjau halaman tamu undangan. Animasi dan musik akan ditampilkan.'>
        <ListItem
          prefix={<Fullscreen strokeWidth={1.5} />}
          onClick={() => router.push(Routes.invitationPublic + `/${id}`)}
        >
          Preview
        </ListItem>
      </ListGroup>
      <ListGroup>
        <InvitationEditorAttendance
          {...{ guests, responses }}
          title='Kehadiran'
        >
          <ListItem prefix={<ListChecks strokeWidth={1.5} />} withChevron>
            Kehadiran
          </ListItem>
        </InvitationEditorAttendance>
        <InvitationEditorMoreGift {...{ id, gift }}>
          <ListItem prefix={<Wallet strokeWidth={1.5} />} withChevron>
            Info virtual
          </ListItem>
        </InvitationEditorMoreGift>
      </ListGroup>
      <ListGroup>
        <Presentation
          title={{ children: 'Musik/audio' }}
          wrapperClasses='before:my-0'
          trigger={{
            asChild: true,
            children: (
              <ListItem
                title='Musik/audio'
                aria-disabled={!InvitationConfig[tier].UploadMusic}
                prefix={<Music size={20} />}
                withChevron
              />
            ),
          }}
        >
          <ListGroup
            className='p-4'
            info={
              <>
                <span className='mb-6 inline-block'>
                  Upload audio dengan format .mp3 (maksimal{' '}
                  {Config.MusicUploadSizeMB}MB)
                </span>
                <span className='inline-block'>
                  Dengan mengunggah audio, Anda telah memastikan bahwa audio
                  yang telah diunggah tidak melanggar hak cipta.
                </span>
              </>
            }
          >
            <ButtonUpload
              bucket={Bucket.Invitation}
              folder={id}
              defaultValue={music?.fileId}
              maxSize={Config.MusicUploadSizeMB}
              format={['audio/mp3']}
              onComplete={updateMusic}
              className='bg-zinc-100'
              removeClasses='order-1 ml-2 -mr-7'
              wrapperClasses='flex flex-wrap items-center justify-center min-h-[73px]'
            >
              {music?.url && (
                <audio
                  src={music.url}
                  controls
                  className='mb-2.5 w-full'
                  preload='none'
                />
              )}
            </ButtonUpload>
          </ListGroup>
        </Presentation>
        <InvitationEditorUpgrade
          {...{ type, tier, id, name: slug }}
          onSuccessCallback={() => delay(280).then(() => onOpenChange(false))}
        >
          <ListItem
            withChevron
            prefix={<CircleFadingArrowUp size={20} />}
            suffix={
              isPending ? (
                <span className='inline-flex size-safe items-center justify-center rounded-full bg-yellow-400 text-sm text-black'>
                  !
                </span>
              ) : (
                void 0
              )
            }
            onClick={
              !isPending
                ? void 0
                : async (e) => {
                    e.preventDefault()
                    onOpenChange(false)

                    router.push(Routes.invitationTransaction)
                  }
            }
          >
            Upgrade
          </ListItem>
        </InvitationEditorUpgrade>
      </ListGroup>
    </Presentation>
  )
}

export default InvitationEditorMore
