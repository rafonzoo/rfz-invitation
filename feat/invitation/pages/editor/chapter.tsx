'use client'

import { tw } from '@/lib'
import { capitalUnstrip, formattedSlug } from '@/feat/invitation/helpers'

type InvitationChapterProps = {
  type: string
  slug: string
  isPublic?: boolean
}

const InvitationEditorChapter: RF<InvitationChapterProps> = ({
  type,
  slug,
  isPublic,
  children,
}) => {
  return (
    <section
      id='section-chapter'
      className={tw(
        'sticky left-0 top-0 z-4 w-full border-b border-zinc-500/50 bg-black/80 text-white backdrop-blur duration-300 ease-default',
        'transition-transform will-change-transform md-max:group-data-[presentation]/body:-translate-y-8'
      )}
    >
      <div className='mx-auto flex h-14 max-w-175 items-center justify-between lg:max-w-245 md-max:px-4'>
        <div className='flex w-0 flex-grow flex-col'>
          <span className='block text-xxs tracking-base opacity-70'>
            {capitalUnstrip(type)}
          </span>
          <p className='-mt-0 truncate text-lg font-semibold !leading-6'>
            {formattedSlug(slug)}
          </p>
        </div>
        <div className='flex flex-nowrap items-center'>{children}</div>
      </div>
    </section>
  )
}

export default InvitationEditorChapter
