'use client'

import type { InvitationDetail } from '@/feat/invitation/schema'
import { ChevronRight, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { tw } from '@/lib'
import { InvitationTierEnum } from '@/feat/invitation/config'
import { removeInvitation } from '@/feat/invitation/action'
import { capitalize } from '@/core/utils'
import { Routes } from '@/core/config'
import {
  capitalUnstrip,
  formattedSlug,
  getColorByType,
  isPaidVersion,
} from '@/feat/invitation/helpers'
import ListGroup from '@/components/list/group'
import Tapview from '@/components/tapview'
import ButtonIcon from '@/components/button/icon'
import IconType from '@/feat/invitation/components/icon-type'
import LazyImage from '@/feat/invitation/components/image/lazy'
import Toast from '@/lib/toast'
import DayJS from '@/lib/dayjs'

type CollectionListDisplay = Pick<
  InvitationDetail,
  'id' | 'pid' | 'type' | 'slug' | 'updatedAt'
> & {
  tier: InvitationTierEnum
  metaImage: string
}

type CollectionListProps = {
  list: CollectionListDisplay[]
  title: string
}

const CollectionListItem: RFZ<CollectionListDisplay> = ({
  id,
  pid,
  type,
  slug,
  tier,
  updatedAt,
  metaImage,
}) => {
  const [removing, setRemoving] = useState(false)
  const relativeTime = DayJS(updatedAt).tz().fromNow()
  const router = useRouter()
  const canRemove =
    !isPaidVersion(tier) || process.env.NEXT_PUBLIC_SITE_ENV !== 'production'

  return (
    <div className='group/collection-list relative'>
      <ListGroup className='divide-none' disablePeerList>
        <Tapview
          aria-disabled={removing}
          onClick={() => router.push(Routes.invitationEditor + `/${id}`)}
        >
          <div className='rounded-field px-4 py-3 peer-hover:bg-zinc-200/50 dark:bg-zinc-800'>
            <div className='flex items-center justify-between'>
              <div
                className={tw(
                  'flex items-center justify-center',
                  getColorByType(type)
                )}
              >
                <IconType {...{ type }} />
                <div className='ml-1.5 text-sm font-semibold capitalize tracking-normal text-black first:ml-0'>
                  {capitalUnstrip(type)}
                </div>
              </div>
              <div className='ml-auto inline-flex w-0 flex-grow pl-4 text-xs font-medium tracking-base text-zinc-500/75'>
                <p className='flex-grow truncate text-right'>
                  {relativeTime.includes('beberapa detik')
                    ? 'Baru saja'
                    : capitalize(relativeTime)}
                </p>
                <ChevronRight size={16} className='-ml-0.5 -mr-1 min-w-4' />
              </div>
            </div>
            <div className='mt-3 flex h-[61px] justify-between'>
              <div className='flex w-0 flex-grow flex-col justify-end'>
                <div className='truncate font-semibold'>
                  {formattedSlug(slug)}
                </div>
                <div className='mt-0.5 text-xs font-semibold uppercase tracking-normal text-zinc-500/75'>
                  {tier}
                </div>
              </div>
              <div className='relative ml-4 size-[61px] overflow-hidden rounded-field bg-zinc-100'>
                {metaImage && (
                  <LazyImage
                    src={metaImage}
                    alt='Meta image'
                    className='absolute left-0 top-0 h-full w-full object-cover object-center'
                  />
                )}
              </div>
            </div>
          </div>
        </Tapview>
      </ListGroup>
      {canRemove && (
        <form
          className={tw(
            'absolute bottom-[26px] right-[30px] z-2 text-sm font-medium tracking-normal',
            'translate-x-4 opacity-0 transition-opacity-transform will-change-transform-opacity',
            'group-hover/collection-list:translate-x-0 group-hover/collection-list:opacity-100'
          )}
          action={async (form) => {
            const { errorMessage } = await removeInvitation(form)

            setRemoving(false)
            if (errorMessage) {
              return Toast.error(errorMessage)
            }
          }}
        >
          <input type='hidden' name='id' value={id} />
          {pid && <input type='hidden' name='pid' value={pid} />}
          <ButtonIcon
            className='inline-flex size-8 bg-red-200 text-red-600 hover:bg-red-500 hover:text-white'
            tabIndex={-1}
            aria-label='Hapus'
            type='submit'
            onClick={(e) => {
              // prettier-ignore
              if (window.confirm(`Hapus "${formattedSlug(slug)}" dari daftar koleksi?\n\nData yang tersimpan didalamnya seperti foto/video juga akan dihapus.`)) {
                return setRemoving(true)
              }

              e.preventDefault()
            }}
          >
            <Trash2 size={16} />
          </ButtonIcon>
        </form>
      )}
    </div>
  )
}

const CollectionList: RF<CollectionListProps> = ({ list, title }) => {
  if (!list.length) {
    return null
  }
  return (
    <div className='mt-4'>
      <h3 className='mb-1 text-lead-title-sm font-semibold'>{title}</h3>
      <div className='grid gap-safe lg:grid-cols-2'>
        {list.map((invitation) => (
          <CollectionListItem key={invitation.id} {...invitation} />
        ))}
      </div>
    </div>
  )
}

export default CollectionList
