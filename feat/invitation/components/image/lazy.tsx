'use client'

import { useEffect, useRef } from 'react'

type LazyImageProps = Omit<TAG<'img'>, 'ref'> & {
  enable?: boolean
}

const LazyImage: RFZ<LazyImageProps> = ({
  enable = true,
  src = '',
  alt = 'Image',
  ...props
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const target = imageRef.current

    if (!target || !enable) {
      return
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          target.src = src
          target.removeAttribute('data-src')

          obs.disconnect()
        }
      })
    })

    observer.observe(target)
    return () => observer.disconnect()
  }, [enable, src])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      data-src={enable ? src : void 0}
      src={enable ? void 0 : src}
      {...props}
      {...{ alt }}
    />
  )
}

export default LazyImage
