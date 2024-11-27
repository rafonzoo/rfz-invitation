'use client'

import type { InvitationEvents } from '@/feat/invitation/schema'
import { Map } from 'lucide-react'
import { tw } from '@/lib'
import { useAos } from '@/hooks/animation'
import Link from 'next/link'

type InvitationEventProps = {
  events: InvitationEvents
}

const InvitationEventSection: RFA<InvitationEventProps> = (args) => {
  const { enableAnimation, events, children } = args
  const { config } = useAos({ enable: enableAnimation })

  return (
    <section
      id='section-events'
      className={tw('relative z-2 pb-44', !enableAnimation && 'bg-black pb-32')}
    >
      <ul
        className={tw(
          'mx-auto flex w-[87.5%] flex-col flex-nowrap justify-center space-y-15 text-center text-white md:flex-row md:gap-6 md:space-x-15 md:space-y-0 md-max:max-w-[340px]'
        )}
      >
        {events.map((event, index) => (
          <li {...config} key={index} className='will-change-transform-opacity'>
            <div className='mx-auto max-w-93 font-bold'>
              <p className='md:text-lead-title-sm lg:text-large-title-sm'>
                {event.date}
              </p>
              <h3 className='mt-3 text-large-title-sm lg:mt-4 lg:text-large-title-lg'>
                {event.name}
              </h3>
              <address className='mb-5 mt-1 line-clamp-5 font-normal not-italic text-zinc-300 md:mb-6 md:mt-1.5 lg:mb-8 lg:mt-3'>
                {event.address}
              </address>
              <div>
                <Link
                  href={event.mapUrl}
                  target='_blank'
                  className='inline-flex items-center rounded-full bg-primary px-5 py-3 text-white'
                  onClick={(e) => {
                    const href = e.currentTarget.href

                    if (
                      !['http://', 'https://'].some((link) =>
                        href.includes(link)
                      )
                    ) {
                      e.preventDefault()
                    }
                  }}
                >
                  <Map size={20} className='mr-1.5' />
                  Buka maps
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {children}
    </section>
  )
}

export default InvitationEventSection
