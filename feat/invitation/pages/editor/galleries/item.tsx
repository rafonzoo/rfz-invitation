/* eslint-disable react-hooks/rules-of-hooks */

'use client'

import type { UploadCallback } from '@/core/schema'
import type Sortable from 'sortablejs'
import { serialize } from 'object-to-formdata'
import { useEffect, useRef, useState } from 'react'
import { tw } from '@/lib'
import { Bucket } from '@/core/config'
import { updateGalleries } from '@/feat/invitation/action'
import { useLibrary } from '@/hooks/common'
import ButtonUpload from '@/components/upload/button'
import Toast from '@/lib/toast'

type GalleriesItemProps = {
  id: string
  role: string
  className?: string
  wrapperClasses?: string
  items: ({ id: string; url: string; index: number } | undefined)[]
}

const InvitationEditorGalleriesItem: RFZ<GalleriesItemProps> = ({
  id,
  role,
  items,
  className,
  wrapperClasses,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { sortablejs } = useLibrary()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const sortableCurrent = useRef<Sortable | null>(null)
  const canSort = items.filter(Boolean).length > 1

  useEffect(() => {
    const wrapper = wrapperRef.current

    if (isLoading || !canSort || !wrapper) {
      return
    }

    const initSortable = async () => {
      const Sortable = await sortablejs()

      try {
        // Make sure it doesn't broke hydration
        sortableCurrent.current?.destroy()
      } catch {}

      sortableCurrent.current = new Sortable(wrapper, {
        animation: 300,
        delay: 300,
        draggable: '.media-item',
        forceFallback: true,
        chosenClass: 'selected',
        onChoose: () => wrapper.classList.add('on-drag'),
        onUnchoose: () => wrapper.classList.remove('on-drag'),
      })
    }

    initSortable()
    return () => sortableCurrent.current?.destroy()
  }, [isLoading, canSort, sortablejs])

  async function updateGallery(payload: Partial<UploadCallback>) {
    const { errorMessage } = await updateGalleries(
      serialize({ id, role, ...payload })
    )

    if (!errorMessage) {
      return Toast.error(errorMessage)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={tw(
        'flex flex-nowrap space-x-3 overflow-x-auto',
        wrapperClasses,

        // Drag parent
        canSort && 'group/media [.on-drag&]:cursor-grabbing'
      )}
    >
      {items.map((item, index) => (
        <ButtonUpload
          defaultValue={item?.id}
          index={index}
          key={item?.id ?? index}
          folder={id}
          bucket={Bucket.Invitation}
          format={['image/png', 'image/jpg', 'image/jpeg']}
          onComplete={updateGallery}
          onLoading={setIsLoading}
          removeClasses='absolute top-1.5 right-1.5 group-[.on-drag]/media:hidden'
          className='absolute bottom-2.5 border group-[.on-drag]/media:hidden'
          wrapperClasses={tw(
            'relative flex flex-col items-center',

            // Drag item
            item &&
              tw(
                'group/media-item media-item transition-opacity duration-300 will-change-opacity',
                'group-[.on-drag]/media:[&.selected]:z-1 group-[.on-drag]/media:[&:not(.selected)]:opacity-40',
                canSort && !isLoading && 'group-[:not(.on-drag)]/media:cursor-grab' // prettier-ignore
              )
          )}
        >
          <div
            style={item ? { backgroundImage: `url(${item.url})` } : void 0}
            className={tw(
              'rounded-field',
              className,
              item
                ? 'bg-cover bg-center bg-no-repeat'
                : 'border-2 border-dashed border-zinc-300'
            )}
          >
            {item && (
              <input
                type='hidden'
                name={`${role}-${item.index + 1}`}
                value={item.id}
              />
            )}
          </div>
        </ButtonUpload>
      ))}
    </div>
  )
}

export default InvitationEditorGalleriesItem
