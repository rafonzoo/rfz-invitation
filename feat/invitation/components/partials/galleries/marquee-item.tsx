'use client'

import type { InvitationGalleries } from '@/feat/invitation/schema'
import { useEffect, useRef } from 'react'
import { tw } from '@/lib'
import { useGSAP } from '@/hooks/animation'
import { useObserver } from '@/hooks/common'

const MARQUEES = [
  { url: '0', bg: tw('bg-red-200') },
  { url: '1', bg: tw('bg-green-200') },
  { url: '2', bg: tw('bg-indigo-200') },
  { url: '3', bg: tw('bg-cyan-200') },
  { url: '4', bg: tw('bg-blue-200') }, // Minimum
  { url: '5', bg: tw('bg-violet-200') },
  { url: '6', bg: tw('bg-purple-200') },
  { url: '7', bg: tw('bg-lime-200') },
  { url: '8', bg: tw('bg-blue-200') },
  // { url: '9', bg: tw('bg-blue-200') },
  // { url: '10', bg: tw('bg-blue-200') },
  // { url: '11', bg: tw('bg-blue-200') },
  // { url: '12', bg: tw('bg-blue-200') },
]

type MarqueeItemProps = {
  speed: number
  className?: string
  enableAnimation?: boolean
  galleries: InvitationGalleries
  onSelected?: (id: string) => void
}

type MarqueeImageProps = {
  imageUrl: string
  className: string
  isDisabled?: boolean
  onClick?: () => void
}

const MarqueeImage: RFZ<MarqueeImageProps> = ({
  imageUrl,
  className,
  isDisabled,
  onClick,
}) => {
  const { isIntersecting, setRef } = useObserver()

  return (
    <a
      ref={setRef}
      href='/#'
      style={isIntersecting ? { backgroundImage: `url(${imageUrl})` } : void 0}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      className={tw(
        'mx-1.5 mb-3 inline-block h-[118px] w-[210px] rounded-field bg-cover bg-center bg-no-repeat text-sm tracking-normal lg:mx-2.5 lg:mb-5 lg:h-[212px] lg:w-[378px]',
        isDisabled && 'will-change-transform',
        className
      )}
    />
  )
}

const MarqueeItem: RF<MarqueeItemProps> = (props) => {
  const {
    className,
    speed,
    galleries,
    enableAnimation = true,
    onSelected,
  } = props

  const { gsap } = useGSAP({ enable: enableAnimation })
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const tween = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    const target = wrapperRef.current
    const child = target?.firstElementChild
    const currentTween = tween.current

    if (!gsap || !target || !child) {
      return
    }

    gsap.config({ force3D: false })

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const distance = entry.borderBoxSize[0].inlineSize
        const mobile = distance < 1900

        if (tween.current) {
          tween.current.revert()
          tween.current.kill()
        }

        tween.current = gsap.to(target, {
          x: -distance,
          ease: 'none',
          duration: mobile ? speed + 15 : speed,
          repeat: -1,
          overwrite: true,
        })
      })
    })

    observer.observe(child)

    return () => {
      observer.unobserve(child)
      currentTween?.kill()
    }
  }, [gsap, speed])

  return (
    <div
      ref={wrapperRef}
      style={gsap ? { marginLeft: 0 } : void 0}
      className={tw(
        'whitespace-nowrap text-[0] leading-[0] will-change-transform',
        className
      )}
    >
      {[galleries, galleries].map((gallery, cloneIndex) => (
        <div
          key={cloneIndex}
          className='inline-block whitespace-nowrap leading-[inherit] text-[inherit]'
          onMouseEnter={() => tween.current?.timeScale(0.25)}
          onTouchStart={() => tween.current?.timeScale(0.25)}
          onMouseLeave={() => tween.current?.timeScale(1)}
          onTouchEnd={() => tween.current?.timeScale(1)}
          onTouchCancel={() => tween.current?.timeScale(1)}
        >
          {gallery.map((item, index) => (
            <MarqueeImage
              key={index}
              imageUrl={item.url}
              onClick={() => onSelected?.(item.fileId)}
              isDisabled={!enableAnimation}
              className={tw(
                'mx-1.5 mb-3 inline-block h-[118px] w-[210px] rounded-field bg-cover bg-center bg-no-repeat text-sm tracking-normal lg:mx-2.5 lg:mb-5 lg:h-[212px] lg:w-[378px]',
                MARQUEES[index].bg
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default MarqueeItem
