'use client'

import type { InvitationGalleries } from '@/feat/invitation/schema'
import { useState } from 'react'
import { GalleryHorizontal } from 'lucide-react'
import { tw } from '@/lib'
import { Config } from '@/core/config'
import { updatePhotoOrder } from '@/feat/invitation/action'
import { formEntries, keys } from '@/core/utils'
import { InvitationConfig, InvitationTierEnum } from '@/feat/invitation/config'
import { isPaidVersion } from '@/feat/invitation/helpers'
import Presentation from '@/components/presentation'
import ListGroup from '@/components/list/group'
import Button from '@/components/button'
import InvitationGallerySection from '@/feat/invitation/components/galleries'
import InvitationEditorGalleriesItem from '@/feat/invitation/pages/editor/galleries/item'
import Toast from '@/lib/toast'

type GalleriesProps = {
  id: string
  tier: InvitationTierEnum
  galleries: InvitationGalleries
}

const Carousel = Config.GalleryType.InvitationCarousel
const Marqueetop = Config.GalleryType.InvitationMarqueeTop
const MarqueeBot = Config.GalleryType.InvitationMarqueeBottom

const InvitationEditorGalleries: RFZ<GalleriesProps> = ({
  id,
  tier,
  galleries,
}) => {
  const [open, onOpenChange] = useState(false)
  const [locked, setLocked] = useState(false)
  const { MaxPhoto } = InvitationConfig[tier]
  const carouselMaxItems = MaxPhoto - (50 / 100) * MaxPhoto
  const marqueesMaxItems = MaxPhoto - (75 / 100) * MaxPhoto
  // const marqueesMaxItems = 5
  // const carouselMaxItems = MaxPhoto - marqueesMaxItems * 2

  function safeToClose(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest('form')
    if (!form) return true

    const data = formEntries(new FormData(form))
    const keyed = keys(data).filter((key) => key !== 'id')
    const before = keyed.map((key) => data[key])
    const after = [
      ...sort(galleries, Carousel).map((item) => item.fileId),
      ...sort(galleries, Marqueetop).map((item) => item.fileId),
      ...sort(galleries, MarqueeBot).map((item) => item.fileId),
    ]

    return after.every((id, index) => before[index] === id)
  }

  async function updateSheet(form: FormData) {
    setLocked(true)

    const { errorMessage } = await updatePhotoOrder(form)
    setLocked(false)

    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  if (!isPaidVersion(tier)) {
    return null
  }

  return (
    <InvitationGallerySection galleries={galleries} enableAnimation={false}>
      <div
        className={
          tw(
            !sort(galleries, Marqueetop).length && !sort(galleries, MarqueeBot).length && 'h-[118px]' // prettier-ignore
          ) || void 0
        }
      >
        <div className='absolute bottom-0 left-0 w-full -translate-y-13'>
          <div className='relative mx-auto size-10'>
            <span className='pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-80'></span>
            <Presentation
              {...{ locked }}
              root={{ open, onOpenChange }}
              title={{ children: 'Foto Galeri' }}
              trigger={{
                'aria-label': 'Edit galleries',
                title: 'Setelan galeri',
                className:
                  'relative z-1 inline-flex size-10 items-center justify-center rounded-full bg-primary text-white',
              }}
            >
              <div className='flex rounded-field bg-white px-4 py-3'>
                <div className='mr-3 mt-1 size-6 rounded-md text-zinc-400'>
                  <GalleryHorizontal />
                </div>
                <div className='w-0 flex-grow'>
                  <p className='font-semibold'>Mengatur urutan foto</p>
                  <p className='mt-0.5 text-sm tracking-normal'>
                    Tahan kemudian geser kiri atau kanan untuk mengatur urutan.
                  </p>
                </div>
              </div>
              <form action={updateSheet} className='mt-8 flex flex-col'>
                <ListGroup
                  title={
                    <div className='mb-1.5 ml-4 flex justify-between text-sm font-semibold tracking-normal'>
                      <h3>Upload atau urutkan</h3>
                      <span className='font-normal text-zinc-500'>
                        {
                          [
                            ...sort(galleries, Carousel),
                            ...sort(galleries, Marqueetop),
                            ...sort(galleries, MarqueeBot),
                          ].length
                        }
                        /{InvitationConfig[tier].MaxPhoto}
                      </span>
                    </div>
                  }
                >
                  <InvitationEditorGalleriesItem
                    {...{ id }}
                    role={Carousel}
                    className='h-[250px] w-[150px]'
                    wrapperClasses='my-6 px-[calc((((100%_+_32px)_-_32px)_-_150px)_/_2)]'
                    items={[
                      ...sort(galleries, Carousel).map(
                        ({ fileId, url, index }) => ({
                          id: fileId,
                          url,
                          index,
                        })
                      ),
                      undefined,
                    ].slice(0, carouselMaxItems)}
                  />
                </ListGroup>
                <ListGroup
                  disablePeerList
                  className='mt-4 divide-none'
                  info={`Anda bisa menambah sampai dengan ${carouselMaxItems} foto besar dan ${marqueesMaxItems} foto kecil (per baris).`}
                >
                  <InvitationEditorGalleriesItem
                    {...{ id }}
                    role={Marqueetop}
                    className='h-[90px] w-[150px]'
                    wrapperClasses='my-4 px-[calc((((100%_+_32px)_-_32px)_-_150px)_/_2)]'
                    items={[
                      ...sort(galleries, Marqueetop).map(
                        ({ fileId, url, index }) => ({
                          id: fileId,
                          url,
                          index,
                        })
                      ),
                      undefined,
                    ].slice(0, marqueesMaxItems)}
                  />
                  <InvitationEditorGalleriesItem
                    {...{ id }}
                    role={MarqueeBot}
                    className='h-[90px] w-[150px]'
                    wrapperClasses='mb-4 px-[calc((((100%_+_32px)_-_32px)_-_150px)_/_2)]'
                    items={[
                      ...sort(galleries, MarqueeBot).map(
                        ({ fileId, url, index }) => ({
                          id: fileId,
                          url,
                          index,
                        })
                      ),
                      undefined,
                    ].slice(0, marqueesMaxItems)}
                  />
                </ListGroup>
                <input type='hidden' name='id' value={id} />
                <Button
                  className='absolute right-3 top-4 text-primary'
                  onClick={(e) => {
                    if (!safeToClose(e)) {
                      return
                    }

                    onOpenChange(false)
                    e.preventDefault()
                  }}
                >
                  Save
                </Button>
              </form>
            </Presentation>
          </div>
        </div>
      </div>
    </InvitationGallerySection>
  )
}

function sort(items: InvitationGalleries, type: string) {
  return items
    .filter((item) => item.role === type)
    .sort((a, b) => a.index - b.index)
}

export default InvitationEditorGalleries
