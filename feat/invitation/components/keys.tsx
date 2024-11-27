'use client'

import type { InvitationKeys } from '@/feat/invitation/schema'
import { tw } from '@/lib'
import { useAos } from '@/hooks/animation'

type InvitationKeySectionProps = {
  keys: InvitationKeys
}

const InvitationKeySection: RFA<InvitationKeySectionProps> = (args) => {
  const { enableAnimation, children, keys } = args
  const { config } = useAos({ enable: enableAnimation })

  return (
    <section
      id='section-keys'
      className={tw(
        'relative z-2 pb-38 text-white',
        !enableAnimation && 'border-t border-zinc-700 bg-black pt-38'
      )}
    >
      <ul className='mx-auto w-[87.5%] max-w-[340px] space-y-12 text-center md:w-[620px] md:max-w-full lg:w-[870px] xxl:w-245'>
        {keys.map(({ id, text }) => (
          <li
            key={id}
            {...config}
            className='text-large-title-sm font-bold md:text-large-title-lg lg:text-huge-title xxl:text-huge-title-lg'
          >
            {text}
          </li>
        ))}
      </ul>
      {children}
    </section>
  )
}

export default InvitationKeySection
