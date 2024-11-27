'use client'

import type { InvitationGallery } from '@/feat/invitation/schema'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tw } from '@/lib'
import { useGSAP } from '@/hooks/animation'
import { isVideoExtension } from '@/core/helpers'
import LazyImage from '@/feat/invitation/components/image/lazy'

type LandingStickyProps = {
  gallery?: InvitationGallery
}

const LandingSticky: RFA<LandingStickyProps> = (args) => {
  const { gallery, enableAnimation: enable } = args
  const { gsap } = useGSAP({ enable, plugins: ['ScrollTrigger'] })
  const [loadImage, setLoadImage] = useState(false)
  const bgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!gsap) return

    gsap.set('#landing-sticky-background', { opacity: 0 })
    const fade = gsap.to('#landing-sticky-background', {
      opacity: '0.999',
      scrollTrigger: {
        trigger: '#section-landing',
        start: 'top top',
        endTrigger: '#section-keys',
        end: 'bottom+=152px bottom',
        scrub: true,
        onRefresh: () => {
          bgRef.current?.classList.add('will-change-opacity')
        },
        onLeave: () => {
          bgRef.current?.classList.remove('will-change-opacity')
        },
        onEnterBack: () => {
          bgRef.current?.classList.add('will-change-opacity')
        },
      },
    })

    const tickImage = setTimeout(() => setLoadImage(true), 500)

    return () => {
      fade.kill()
      clearTimeout(tickImage)
    }
  }, [gsap])

  useLayoutEffect(() => {
    const landingSticky = document.getElementById('landing-sticky')
    const stickyParents = landingSticky?.parentElement

    if (!enable || !stickyParents || !landingSticky) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement
        const keySection = target.nextElementSibling
        const eventSection = keySection?.nextElementSibling

        if (entry.contentBoxSize) {
          // prettier-ignore
          const height = (
            (keySection?.scrollHeight ?? 0) +
            (eventSection?.scrollHeight ?? 0) +
            entry.contentBoxSize[0].blockSize
          )

          landingSticky.style.height = height + 'px'
        }
      })
    })

    observer.observe(stickyParents)
    return () => observer.unobserve(stickyParents)
  }, [enable])

  return (
    <div
      id='landing-sticky'
      className={tw(
        'absolute left-0 right-0 top-0 bg-black',
        enable ? 'h-[2000px]' : 'h-full'
      )}
    >
      <div className='sticky left-0 top-0 h-screen min-h-[663px] overflow-hidden'>
        <figure
          className={tw(
            'absolute left-0 top-0 z-1 h-full w-full transition-opacity duration-600',
            enable && !loadImage
              ? 'opacity-0 will-change-opacity'
              : 'opacity-100'
          )}
        >
          {!!gallery?.url && isVideoExtension(gallery?.url) && (
            <video
              src={gallery.url /** video/example.mp4 */}
              autoPlay
              playsInline
              muted
              loop
              className='absolute left-0 top-0 h-full w-full object-cover object-top'
            />
          )}
          {!!gallery?.url && !isVideoExtension(gallery?.url) && (
            <LazyImage
              className='absolute left-0 top-0 h-full w-full object-cover object-center'
              src={gallery.url /* https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg */} // prettier-ignore
            />
          )}
        </figure>
        <div
          id='landing-sticky-background'
          ref={bgRef}
          className={tw(
            'absolute bottom-0 left-0 right-0 top-0 z-3 bg-black',
            !enable && 'opacity-0'
          )}
        />
      </div>
    </div>
  )
}

export default LandingSticky
