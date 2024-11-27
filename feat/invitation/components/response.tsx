'use client'

import type { InvitationResponses } from '@/feat/invitation/schema'
import { useParams } from 'next/navigation'
import { Gift, MessagesSquare } from 'lucide-react'
import { InvitationTypeEnum } from '@/feat/invitation/config'
import { Routes } from '@/core/config'
import Link from 'next/link'
import ResponseForm from '@/feat/invitation/components/partials/response/form'
import ResponseList from '@/feat/invitation/components/partials/response/list'
import ResponseInfo from '@/feat/invitation/components/partials/response/info'

type InvitationResponsesProps = {
  responses: InvitationResponses
  type: string
  gift: string
  hasSession?: boolean
  isSpecialGuest?: boolean
}

const asGiftIcon = [
  InvitationTypeEnum.pernikahan,
  InvitationTypeEnum['ulang-tahun'],
]

const InvitationResponseSection: RFZ<InvitationResponsesProps> = ({
  responses,
  type,
  gift,
  hasSession,
  isSpecialGuest,
}) => {
  const paramsId = useParams().id as string | undefined
  const guestId = paramsId?.split('-')?.[1]
  const canComment = !responses.some((res) => res.referenceId === guestId)
  const isGift = asGiftIcon.includes(type)
  const Tag = isGift ? Gift : MessagesSquare

  return (
    <section id='section-response' className='bg-white pt-24 lg:pt-32'>
      <div className='mx-auto mb-6 text-center lg:mb-11 lg-max:max-w-[390px]'>
        <div className='mx-auto inline-flex size-14 items-center justify-center rounded-2xl lg:size-16 lg:rounded-card'>
          <Tag size={56} strokeWidth={1} className='lg:scale-110' />
        </div>
        <p className='text-large-title-lg font-bold -tracking-wide text-black lg:text-huge-title'>
          {isGift ? (
            <>
              Doa <span className='font-thin'>+</span> Kado
            </>
          ) : (
            <>Komentar</>
          )}
        </p>
      </div>
      <div className='mx-auto max-w-118 lg:max-w-143 lg-max:w-[87.5%]'>
        <ResponseInfo {...{ gift }} />
        <ResponseList {...{ responses, hasSession }} />
        <ResponseForm
          {...{ isSpecialGuest }}
          canComment={!!guestId && canComment}
          placeholder={isGift ? 'Ucapan/doa' : 'Komentar'}
        />
      </div>
      <div className='pb-8 pt-4'>
        <p className='mx-auto max-w-118 text-center text-xs tracking-normal text-zinc-500 lg:max-w-143 lg-max:w-[87.5%]'>
          Made with ❤️ by{' '}
          <Link
            href={Routes.invitation}
            target='_blank'
            className='text-primary'
          >
            rf-z.com
          </Link>
        </p>
      </div>
    </section>
  )
}

export default InvitationResponseSection
