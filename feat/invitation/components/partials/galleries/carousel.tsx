'use client'

import type { InvitationGalleries } from '@/feat/invitation/schema'
import { useLayoutEffect, useRef, useState } from 'react'
import { tw } from '@/lib'
import ButtonIcon from '@/components/button/icon'
import ParallaxEffect from './parallax-effect'
import CarouselItem from './carousel-item'

const GALLERIES = [
  { url: '0', bg: tw('bg-red-200') },
  { url: '1', bg: tw('bg-green-200') },
  { url: '2', bg: tw('bg-indigo-200') },
  { url: '3', bg: tw('bg-cyan-200') },
  { url: '4', bg: tw('bg-blue-200') }, // Minimum
]

type GalleriesCarouselProps = {
  carousel: InvitationGalleries
  onSelected?: (id: string) => void
}

const GalleriesCarousel: RFA<GalleriesCarouselProps> = ({
  enableAnimation,
  carousel,
  onSelected,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const config = useRef({ center: 0, width: 0, gap: 0 })
  const isRunning = useRef(false)
  const nextIndex = useRef(activeIndex)
  const tickRef = useRef<NodeJS.Timeout>()

  function stopAndRun(cb: () => void) {
    if (!isRunning.current) {
      clearInterval(tickRef.current)
      cb()
    }
  }

  function onStateChange(state: 'next' | 'previous') {
    const { center, width, gap } = config.current
    const length = GALLERIES.length

    // prettier-ignore
    const distance = (
      state === 'next' ? center + width + gap : center - width - gap
    )

    if (document.querySelector('.disable-feature')) {
      return
    }

    if (listRef.current) {
      listRef.current.style.willChange = 'transform'
      listRef.current.style.transform = `matrix(1, 0, 0, 1, -${distance}, 0)`
      listRef.current.style.transition = [
        'transform',
        '480ms',
        'cubic-bezier(0.231, 0.149, 0.266, 1)',
      ].join(' ')
    }

    const count = state === 'next' ? activeIndex + 1 : activeIndex - 1
    const index = count > length - 1 ? 0 : count < 0 ? length - 1 : count

    nextIndex.current = index
    isRunning.current = true

    setActiveIndex(nextIndex.current)
    setTimeout(applyTransformAndLeft, 500)
  }

  function applyTransformAndLeft() {
    const ul = listRef.current
    const child = Array.from(ul?.children ?? []) as HTMLElement[]

    if (!ul || !child.length) {
      return
    }

    const { gap, width, center } = config.current

    ul.style.transition = ''
    ul.style.willChange = ''
    ul.style.transform = `matrix(1, 0, 0, 1, -${center}, 0)`

    child.forEach((item, index) => {
      let cidx = Math.ceil(child.length / 2)

      if (child.length % 2) {
        cidx -= 1
      }

      let idx = cidx + index - nextIndex.current

      if (idx >= child.length) {
        idx -= child.length
      }

      if (idx < 0) {
        idx = child.length + idx
      }

      item.style.left = `${(width + gap) * idx}px`
    })

    isRunning.current = false
  }

  useLayoutEffect(() => {
    const ul = listRef.current

    if (!ul) return

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        config.current.width = entry.target.firstElementChild?.clientWidth ?? 0
        config.current.gap = config.current.width >= 900 ? 20 : 12

        const { gap, width } = config.current
        config.current.center = (
          ((width + gap) * Math.floor(GALLERIES.length / 2) + gap / 2) - 
          ((entry.borderBoxSize[0].inlineSize - width) / 2)
        ) // prettier-ignore

        applyTransformAndLeft()
      })
    })

    observer.observe(ul)
    return () => observer.disconnect()
  }, [])

  return (
    <ParallaxEffect
      {...{ enableAnimation }}
      activeIndex={activeIndex}
      onStopCallback={() => clearInterval(tickRef.current)}
      onStartCallback={() => {
        if (enableAnimation) {
          clearInterval(tickRef.current)
          tickRef.current = setInterval(() => onStateChange('next'), 5_000)
        }
      }}
    >
      <div
        ref={listRef}
        id='featured-carousel'
        className='absolute left-0 top-0 h-full w-full'
      >
        {carousel.map((gallery, index) => (
          <CarouselItem
            key={index}
            index={index}
            url={gallery.url}
            isDisabled={!enableAnimation}
            onSelected={() => onSelected?.(gallery.fileId)}
            isActive={activeIndex === index}
            isNext={(activeIndex + 1 > GALLERIES.length - 1 ? 0 : activeIndex + 1) === index} // prettier-ignore
            isPrev={(activeIndex - 1 < 0 ? GALLERIES.length - 1 : activeIndex - 1) === index} // prettier-ignore
          />
        ))}
      </div>
      <ul
        className={tw(
          'text-lead-title-lg text-zinc-500 transition-opacity duration-300 will-change-opacity md:text-large-title',
          '[.disable-feature_&]:pointer-events-none [.disable-feature_&]:opacity-0'
        )}
      >
        <li className='absolute left-4 top-1/2 mt-[-2.6470588235rem] text-center'>
          <ButtonIcon
            onClick={() => stopAndRun(() => onStateChange('previous'))}
            className='size-12 -scale-100 before:content-["→"] md:size-20'
            aria-label='Slide sebelumnya'
            tabIndex={-1}
          />
        </li>
        <li className='absolute right-4 top-1/2 mt-[-2.6470588235rem] text-center'>
          <ButtonIcon
            onClick={() => stopAndRun(() => onStateChange('next'))}
            className='size-12 before:content-["→"] md:size-20'
            aria-label='Slide berikutnya'
            tabIndex={-1}
          />
        </li>
      </ul>
    </ParallaxEffect>
  )
}

export default GalleriesCarousel
