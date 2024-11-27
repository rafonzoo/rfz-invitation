'use client'

import type { InvitationLanding } from '@/feat/invitation/schema'
import { useEffect, useRef } from 'react'
import { colors, tw } from '@/lib'
import { useAos, useGSAP } from '@/hooks/animation'
import { InvitationTypeEnum } from '@/feat/invitation/config'
import { capitalUnstrip } from '@/feat/invitation/helpers'
import Safearea from '@/components/layout/safearea'

type LandingContentProps = {
  type: string
  name: string
  landing: InvitationLanding
  guestName?: string
}

const LandingContent: RFA<LandingContentProps> = ({
  children,
  type,
  name,
  landing,
  enableAnimation: enable = true,
  guestName = 'Veronica',
}) => {
  const { config } = useAos({ enable })
  const { gsap } = useGSAP({ enable, plugins: ['ScrollTrigger'] })
  const titleRef = useRef<HTMLDivElement | null>(null)
  const isWedding = type === InvitationTypeEnum.pernikahan
  const title = name || (isWedding ? 'Pria Wanita' : 'Nama Anda')
  const size = Math.ceil(+landing.titleSize)
  const [colorName, colorIndex] = landing.titleColor.split('/')
  const style = {
    // @ts-expect-error
    color: colors[colorName][colorIndex],
    fontSize: `calc((100% - 16px) + ${size * 1.6}px)`,
  }

  useEffect(() => {
    if (!titleRef.current || !gsap) {
      return
    }

    const fade = gsap.to(titleRef.current, {
      opacity: '0.001',
      scrollTrigger: {
        trigger: '#section-keys',
        start: 'top bottom',
        endTrigger: '#section-keys li:first-child',
        end: 'bottom bottom',
        scrub: true,
        onRefresh: () => {
          titleRef.current?.classList.add('will-change-opacity')
        },
        onLeave: () => {
          titleRef.current?.classList.remove('will-change-opacity')
        },
        onEnterBack: () => {
          titleRef.current?.classList.add('will-change-opacity')
        },
      },
    })

    return () => {
      fade.kill()
    }
  }, [gsap])

  return (
    <div
      id='landing-content'
      ref={titleRef}
      className={tw('relative h-full w-full', !enable && 'will-change-opacity')}
    >
      <div
        {...config}
        data-aos-delay='400'
        data-aos-once='true'
        className={tw(
          'absolute bottom-10 left-0 right-0 text-center',
          !landing.subtitleDark && 'text-white'
        )}
      >
        {!isWedding && (
          <div
            className={tw(
              'mb-1 font-semibold uppercase',
              !landing.subtitleDark ? 'text-zinc-400' : 'text-zinc-600'
            )}
          >
            {capitalUnstrip(type)}
          </div>
        )}
        <div
          {...config}
          data-aos-delay='500'
          data-aos-once='true'
          className={tw(
            'mx-auto flex w-[87.5%] flex-col items-center justify-center text-colossal-title-sm font-bold !leading-[1] -tracking-wide *:pb-2',
            'md:w-173 md:flex-row md:text-colossal-title-md lg:w-245 lg:text-colossal-title-lg'
          )}
        >
          {isWedding ? (
            title
              .replace(' ', ' & ')
              .split(' ')
              .map((coupleName, index) =>
                coupleName === '&' ? (
                  <span
                    key={index}
                    className={tw(
                      'hidden h-[1.2em] w-1 pb-0 opacity-40 md:mx-8 md:-mb-0.5 md:block lg:mx-10',
                      !landing.subtitleDark ? 'bg-white' : 'bg-black'
                    )}
                  />
                ) : (
                  <span
                    key={index}
                    style={style}
                    className={tw(
                      'mx-auto inline-block w-fit max-w-full truncate text-center md:mx-0',
                      !index && '-mb-1.5'
                    )}
                  >
                    {coupleName}
                  </span>
                )
              )
          ) : (
            <span
              className='mx-auto inline-block w-fit max-w-full overflow-hidden text-ellipsis'
              style={style}
            >
              {title}
            </span>
          )}
        </div>
        {children}
        <Safearea
          {...config}
          data-aos-delay='600'
          data-aos-once='true'
          className='mt-6 flex flex-col items-center justify-center text-lead-title-sm font-semibold md:mx-auto md:mt-8 md:w-173 md:space-x-1.5 lg:w-245'
        >
          <p>{landing.subtitle}</p>
          <p className='underline'>{guestName}</p>
        </Safearea>
      </div>
    </div>
  )
}

export default LandingContent
