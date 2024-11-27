'use client'

import type { InvitationGalleries } from '@/feat/invitation/schema'
import type { LightGallery } from 'lightgallery/lightgallery'
import { useEffect, useRef } from 'react'
import { Fullscreen } from 'lucide-react'
import { tw } from '@/lib'
import { cloneMaxArray } from '@/core/helpers'
import { Config } from '@/core/config'
import Button from '@/components/button'
import GalleriesCarousel from '@/feat/invitation/components/partials/galleries/carousel'
import GalleriesMarquee from '@/feat/invitation/components/partials/galleries/marquee'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'

type GallerySection = {
  galleries: InvitationGalleries
}

const Role = Config.GalleryType

const InvitationGallerySection: RFA<GallerySection> = ({
  enableAnimation,
  galleries,
  children,
}) => {
  const lightGalleryRef = useRef<LightGallery | null>(null)
  const sortedGalleries = {
    carousel: galleries
      .filter((item) => item.role === Role.InvitationCarousel)
      .sort((a, b) => a.index - b.index),
    marqueeTop: galleries
      .filter((item) => item.role === Role.InvitationMarqueeTop)
      .sort((a, b) => a.index - b.index),
    marqueeBottom: galleries
      .filter((item) => item.role === Role.InvitationMarqueeBottom)
      .sort((a, b) => a.index - b.index),
  }

  useEffect(() => {
    return () => {
      lightGalleryRef.current?.destroy()
      lightGalleryRef.current = null
    }
  }, [])

  async function onSelected(id?: string) {
    if (document.querySelector('.disable-feature')) {
      return
    }

    const targets = Array.from(
      document.getElementById('section-galleries')?.querySelectorAll('a') ?? []
    )

    const zoom = (await import('lightgallery/plugins/zoom')).default
    const lg = (await import('lightgallery')).default

    const gallery = [
      ...sortedGalleries.carousel,
      ...sortedGalleries.marqueeTop,
      ...sortedGalleries.marqueeBottom,
    ]

    targets.forEach((target) => {
      lightGalleryRef.current = lg(target, {
        plugins: [zoom],
        dynamic: true,
        dynamicEl: gallery.map((item) => ({ src: item.url })),
      })
    })

    lightGalleryRef.current?.openGallery(
      id ? gallery.findIndex((item) => item.fileId === id) : 0
    )
  }

  return (
    <section
      id='section-galleries'
      className='relative z-1 bg-black text-white'
    >
      {!!sortedGalleries.carousel.length && (
        <div id='galleries-featured' className='enable-feature'>
          <GalleriesCarousel
            {...{ enableAnimation, onSelected }}
            carousel={cloneMaxArray(sortedGalleries.carousel)}
          />
        </div>
      )}
      <div id='galleries-fill' className='sr-only' />
      <GalleriesMarquee
        {...{ enableAnimation, onSelected }}
        sliderTop={cloneMaxArray(sortedGalleries.marqueeTop)}
        sliderBottom={cloneMaxArray(sortedGalleries.marqueeBottom)}
        show={
          !!(
            sortedGalleries.marqueeTop.length ||
            sortedGalleries.marqueeBottom.length
          )
        }
      >
        <div
          className={tw(
            'relative text-center',
            !enableAnimation && 'invisible'
          )}
        >
          <Button
            disabled={!enableAnimation}
            onClick={() => onSelected()}
            className='mb-13 mt-5 inline-flex items-center rounded-full border px-5 py-3 text-sm font-bold tracking-normal hover:opacity-80'
          >
            <Fullscreen size={22} className='mr-1.5' strokeWidth={1.5} />
            Lihat gallery
          </Button>
        </div>
      </GalleriesMarquee>
      {children}
    </section>
  )
}

export default InvitationGallerySection
