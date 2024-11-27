'use client'

import type { InvitationGalleries } from '@/feat/invitation/schema'
import { useLayoutEffect, useRef } from 'react'
import { tw } from '@/lib'
import MarqueeItem from './marquee-item'

type GalleriesCarouselProps = {
  show: boolean
  sliderTop: InvitationGalleries
  sliderBottom: InvitationGalleries
  onSelected?: (id: string) => void
}

const GalleriesMarquee: RFA<GalleriesCarouselProps> = ({
  show,
  enableAnimation,
  sliderTop,
  sliderBottom,
  children,
  onSelected,
}) => {
  const marquee = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const marqueeElement = marquee.current
    const target = document.getElementById('featured-carousel')
    const carousel = document.querySelector<HTMLElement>(
      '#galleries-featured .sticky'
    )

    if (!marqueeElement || !target || !carousel) return

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { blockSize, inlineSize } = entry.borderBoxSize[0]
        const gap = inlineSize >= 1025 ? 20 : 12
        const height = target.clientHeight ?? 0

        marqueeElement.style.marginTop = `-${(blockSize - height) / 2 - gap}px`
      })
    })

    observer.observe(carousel)
    return () => observer.unobserve(carousel)
  }, [])

  if (!show) {
    return null
  }

  return (
    <div
      ref={marquee}
      id='galleries-marquee'
      className={tw(
        'relative overflow-hidden transition-opacity-transform duration-600 ease-default will-change-opacity',
        '[.disable-feature_+_*_+_&]:translate-y-12 [.disable-feature_+_*_+_&]:opacity-0'
      )}
    >
      {!!sliderTop.length && (
        <MarqueeItem
          {...{ enableAnimation, onSelected }}
          speed={40}
          galleries={sliderTop}
        />
      )}
      {!!sliderBottom.length && (
        <MarqueeItem
          {...{ enableAnimation, onSelected }}
          speed={30}
          galleries={sliderBottom}
          className={!enableAnimation ? 'ml-[-210px]' : void 0}
        />
      )}
      {children}
    </div>
  )
}

export default GalleriesMarquee
