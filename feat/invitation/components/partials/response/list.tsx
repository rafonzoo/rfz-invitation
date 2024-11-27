'use client'

import type { InvitationResponse } from '@/feat/invitation/schema'
import { useState } from 'react'
import { CircleUserRound, Eye, Flag } from 'lucide-react'
import { useParams } from 'next/navigation'
import { tw } from '@/lib'
import { toggleFlagComment } from '@/feat/invitation/action'
import Button from '@/components/button'
import ButtonIcon from '@/components/button/icon'

const COLLAPSED_LENGTH = 5

type ResponseListProps = {
  responses: InvitationResponse[]
  hasSession?: boolean
}

const ResponseList: RFZ<ResponseListProps> = ({ responses, hasSession }) => {
  const [page, setPage] = useState(1)
  const [invitationId, guestId = ''] = (useParams().id as string).split('-')
  const slicedComment = responses.slice(
    0,
    page > 1 ? COLLAPSED_LENGTH * 2 * page - COLLAPSED_LENGTH : COLLAPSED_LENGTH
  )

  const fullyExpanded = slicedComment.length === responses.length
  const hasCollapse = slicedComment.length >= COLLAPSED_LENGTH

  if (!invitationId || !responses.length) {
    return null
  }

  return (
    <div id='response-list'>
      <div className='space-y-4'>
        {responses.map(
          (
            { referenceId, alias, createdAt, comment, attendance, outOfTopic },
            index
          ) => (
            <div
              key={index}
              className={tw(
                'group/comment-list relative rounded-xl border p-4',
                referenceId === guestId && 'border-primary ring' // prettier-ignore
              )}
            >
              <div className='mb-3 flex'>
                <div className='mr-3 size-12 rounded-full text-zinc-300'>
                  <CircleUserRound size={48} strokeWidth={1} />
                </div>
                <div className='w-0 flex-grow'>
                  <div className='mb-0.5 mt-px flex items-end font-semibold'>
                    <span className='truncate'>
                      {decodeURIComponent(alias)}
                    </span>
                    {referenceId === guestId && (
                      <span className='mb-[3px] ml-1.5 inline-block truncate text-xs font-normal tracking-normal'>
                        (Anda)
                      </span>
                    )}
                  </div>
                  <div className='text-xs tracking-base text-zinc-500'>
                    {createdAt}
                  </div>
                </div>
              </div>
              <div className='mt-3 min-h-10 xxl:mr-4'>
                {!outOfTopic ? (
                  decodeURIComponent(comment)
                ) : (
                  <span className='block text-sm italic tracking-normal text-zinc-500'>
                    Komentar ini ditutup oleh author karena dianggap menggangu.
                  </span>
                )}
              </div>
              <div className='mt-4'>
                <div className='flex h-6 w-fit items-center rounded-full bg-zinc-100 pl-2 pr-3 text-xs tracking-base text-zinc-600'>
                  <span
                    className={tw(
                      'mr-1.5 block size-2.5 rounded-full',
                      attendance === 'ok' && 'bg-green-600',
                      attendance === 'no' && 'bg-red-600'
                    )}
                  />
                  {attendance === 'ok' && 'Hadir'}
                  {attendance === 'no' && 'Tidak hadir'}
                </div>
              </div>
              {hasSession && (
                <form
                  action={toggleFlagComment}
                  className='absolute right-2 top-2'
                >
                  <input type='hidden' name='id' value={invitationId} />
                  <input type='hidden' name='referenceId' value={referenceId} />
                  <ButtonIcon
                    type='submit'
                    aria-label={!outOfTopic ? 'Tandai' : 'Buka komentar'}
                    onClick={(e) => {
                      // prettier-ignore
                      if (!outOfTopic && !window.confirm('Tandai komentar ini sebagai komentar yang mengganggu?')) {
                        e.preventDefault()
                      }
                    }}
                    className={tw(
                      'translate-x-4 bg-zinc-100 p-2 opacity-0',
                      'transition-opacity-transform will-change-transform-opacity',
                      'group-hover/comment-list:translate-x-0 group-hover/comment-list:opacity-100',
                      'focus-visible:translate-x-0 focus-visible:opacity-100'
                    )}
                  >
                    {!outOfTopic ? (
                      <Flag
                        size={16}
                        strokeWidth={1}
                        fill='#dc2626'
                        className='text-red-600'
                      />
                    ) : (
                      <Eye size={16} strokeWidth={1.5} className='scale-125' />
                    )}
                  </ButtonIcon>
                </form>
              )}
            </div>
          )
        )}
      </div>
      {!!responses.length && hasCollapse && (
        <div className='mt-6 text-center'>
          {fullyExpanded ? (
            <Button
              disabled={!hasCollapse}
              onClick={() => setPage(1)}
              className='text-primary hover:underline'
            >
              Lebih sedikit
            </Button>
          ) : (
            <Button
              disabled={fullyExpanded}
              onClick={() => setPage((prev) => prev + 1)}
              className='text-primary hover:underline'
            >
              Muat lebih banyak
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ResponseList
