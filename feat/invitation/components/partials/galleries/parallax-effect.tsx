'use client'

import { useLayoutEffect, useRef } from 'react'
import { tw } from '@/lib'
import { useGSAP } from '@/hooks/animation'

type ParallaxEffectProps = {
  activeIndex: number
  enableAnimation?: boolean
  onStartCallback?: () => void
  onStopCallback?: () => void
}

const ParallaxEffect: RF<ParallaxEffectProps> = (props) => {
  const {
    activeIndex,
    children,
    enableAnimation: enable = true,
    onStopCallback,
    onStartCallback,
  } = props
  const { scrollTrigger } = useGSAP({ enable, plugins: ['ScrollTrigger'] })
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const depthEffect = useRef(false)
  const isComplete = useRef(false)

  useLayoutEffect(() => {
    const root = document.getElementById('galleries-featured')
    const list = document.getElementById('featured-carousel')
    const stickyEl = stickyRef.current
    const activeEl = list?.children?.[activeIndex] as HTMLElement | null
    const outerEl = activeEl?.firstElementChild as HTMLElement | null
    const innerEl = outerEl?.firstElementChild as HTMLElement | null
    const titleEl = activeEl?.querySelector<HTMLElement>('.list-info')
    const nextEl = list?.querySelector<HTMLElement>('.nextitem')
    const prevEl = list?.querySelector<HTMLElement>('.previtem')
    const canvastl = outerEl?.nextElementSibling as HTMLElement | null
    const canvastr = canvastl?.nextElementSibling as HTMLElement | null
    const canvasbr = canvastr?.nextElementSibling as HTMLElement | null
    const canvasbl = canvasbr?.nextElementSibling as HTMLElement | null

    if (
      !root ||
      !list ||
      !stickyEl ||
      !activeEl ||
      !outerEl ||
      !innerEl ||
      !titleEl ||
      !nextEl ||
      !prevEl ||
      !canvastl ||
      !canvastr ||
      !canvasbr ||
      !canvasbl ||
      !scrollTrigger
    ) {
      return
    }

    let isMobile: boolean
    let isLarge: boolean
    let isSmall: boolean
    let outerScaleX = 0
    let outerScaleY = 0
    let innerScaleX = 0
    let innerScaleY = 0
    let innerDepthScaleX = 0
    let innerDepthScaleY = 0
    let titleY = 0
    let titleScaleX = 0
    let titleScaleY = 0
    let nextPrevX = 0
    let canvasX = 0
    let canvasY = 0

    const childs = Array.from(list.children) as HTMLElement[]
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { inlineSize: rcw, blockSize: rch } = entry.borderBoxSize[0]
        const { clientWidth: tcw, clientHeight: tch } = activeEl

        isMobile = rcw < 768
        isSmall = rcw < 321
        isLarge = rcw >= 1025

        outerScaleX = rcw / tcw
        outerScaleY = rch / tch
        innerScaleX = Math.max(rch / ((rcw * tch) / tcw), 1)
        innerScaleY = Math.max(((tch / tcw) * rcw) / rch, 1)
        innerDepthScaleX = Math.max(rch / ((rcw * tch) / (tcw * 1.1)), 1.1)
        innerDepthScaleY = Math.max((((tch * 1.1) / tcw) * rcw) / rch, 1.1)

        titleScaleX = (tcw * (isMobile ? 1.35714304 : isLarge ? 1.406090650778092 : 1.5)) / rcw // prettier-ignore
        titleScaleY = (tch * (isMobile ? 1.35714304 : isLarge ? 1.406090650778092 : 1.5025)) / rch // prettier-ignore
        titleY = isSmall ? 472.181859 : isMobile ? 532.130625 : isLarge ? 546.105827 : 327.21 // prettier-ignore

        nextPrevX = (rcw - tcw) / 2
        canvasX = (rcw - tcw) / 2 + 4
        canvasY = (rch - tch) / 2 + 4

        if (!isComplete.current) {
          outerEl.style.transform = `scale(${outerScaleX}, ${outerScaleY})`
          innerEl.style.transform = `scale(${innerDepthScaleX}, ${innerDepthScaleY})`

          nextEl.style.transform = `scale(${1.024}) translateX(${nextPrevX}px)`
          prevEl.style.transform = `scale(${1.024}) translateX(${-nextPrevX}px)`
          nextEl.style.opacity = `${0.001}`
          prevEl.style.opacity = `${0.001}`

          canvastl.style.transform = `translate(${-canvasX}px, ${-canvasY}px) scale(0.5, 0.5)`
          canvastr.style.transform = `translate(${canvasX}px, ${-canvasY}px) scale(-0.5, 0.5)`
          canvasbr.style.transform = `translate(${canvasX}px, ${canvasY}px) scale(-0.5, -0.5)`
          canvasbl.style.transform = `translate(${-canvasX}px, ${canvasY}px) scale(0.5, -0.5)`
        }
      })
    })

    childs.forEach((child) => {
      child.style.transform = `translateZ(${0}px)`
      child.style.opacity = ''
    })

    // Outer
    const outer = scrollTrigger.create({
      trigger: '#section-events',
      start: 'bottom top',
      endTrigger: '#galleries-fill',
      end: `top bottom`,
      scrub: true,
      onRefreshInit: () => {
        depthEffect.current = true

        if (!isComplete.current) {
          root.className = root.className.replace('enable-', 'disable-')
          onStopCallback?.()
        }
      },
      onEnterBack: () => {
        isComplete.current = false
        depthEffect.current = true

        root.className = root.className.replace('enable-', 'disable-')
        onStopCallback?.()
      },
      onLeave: () => {
        isComplete.current = true
        depthEffect.current = false

        root.className = root.className.replace('disable-', 'enable-')
        onStartCallback?.()
      },
      onUpdate: (self) => {
        const scaleX = (outerScaleX - ((outerScaleX - 1) * self.progress) / 1).toFixed(6) // prettier-ignore
        const scaleY = (outerScaleY - ((outerScaleY - 1) * self.progress) / 1).toFixed(6) // prettier-ignore

        outerEl.style.transform = `scale(${scaleX}, ${scaleY})`
      },
    })

    // Inner
    const inner = scrollTrigger.create({
      scrub: true,
      trigger: '#section-events',
      start: 'bottom top',
      endTrigger: '#galleries-fill',
      end: `top bottom`,
      onLeave: () => (depthEffect.current = false),
      onEnterBack: () => (depthEffect.current = true),
      onUpdate: (self) => {
        const scaleX = (innerScaleX - ((innerScaleX - 1) * self.progress) / 1).toFixed(6) // prettier-ignore
        const scaleY = (innerScaleY - ((innerScaleY - 1) * self.progress) / 1).toFixed(6) // prettier-ignore

        innerEl.style.transform = `scale(${scaleX}, ${scaleY})`
      },
    })

    // Depth
    const depth = scrollTrigger.create({
      scrub: true,
      trigger: '#section-events',
      start: 'bottom bottom',
      end: 'bottom top',
      onLeave: () => inner.refresh(),
      onUpdate: (self) => {
        if (!depthEffect.current || isComplete.current) {
          return
        }

        innerEl.style.transform = `scale(${[
          (innerDepthScaleX - ((innerDepthScaleX - innerScaleX) * self.progress) / 1).toFixed(6), // prettier-ignore
          (innerDepthScaleY - ((innerDepthScaleY - innerScaleY) * self.progress) / 1).toFixed(6), // prettier-ignore
        ].join(', ')})`
      },
    })

    // State
    const state = scrollTrigger.create({
      scrub: true,
      trigger: '#section-events',
      start: 'bottom top',
      endTrigger: '#galleries-fill',
      end: `top bottom`,
      onUpdate: (self) => {
        const scale = (1.024 - ((1.024 - 1) * self.progress) / 1).toFixed(4)
        const transX = (nextPrevX - (nextPrevX * self.progress) / 1).toFixed(5) // prettier-ignore

        nextEl.style.transform = `scale(${scale}) translateX(${transX}px)`
        prevEl.style.transform = `scale(${scale}) translateX(${-transX}px)`
      },
    })

    // Fade
    const fade = scrollTrigger.create({
      scrub: true,
      trigger: '#galleries-fill',
      start: 'top-=75px bottom',
      end: 'top bottom',
      onUpdate: (self) => {
        const opacity = 0.001 - ((0.001 - 1) * self.progress) / 1

        nextEl.style.opacity = `${(opacity === 1 ? 0.999 : opacity).toFixed(6)}`
        prevEl.style.opacity = `${(opacity === 1 ? 0.999 : opacity).toFixed(6)}`
      },
    })

    // Canvas
    const canvas = scrollTrigger.create({
      trigger: '#section-events',
      start: 'bottom top',
      endTrigger: '#galleries-fill',
      end: 'top bottom',
      scrub: true,
      onUpdate: (self) => {
        const x = (canvasX - (canvasX * self.progress) / 1).toFixed(5)
        const y = (canvasY - (canvasY * self.progress) / 1).toFixed(5)

        canvastl.style.transform = `translate(${-x}px, ${-y}px) scale(0.5, 0.5)`
        canvastr.style.transform = `translate(${x}px, ${-y}px) scale(-0.5, 0.5)`
        canvasbr.style.transform = `translate(${x}px, ${y}px) scale(-0.5, -0.5)`
        canvasbl.style.transform = `translate(${-x}px, ${y}px) scale(0.5, -0.5)`
      },
    })

    const titleDepth = scrollTrigger.create({
      scrub: true,
      trigger: '#section-events',
      start: 'bottom bottom',
      end: 'bottom top',
      onLeave: () => inner.refresh(),
      onUpdate: (self) => {
        if (!depthEffect.current || isComplete.current) {
          return
        }

        const y = (titleY - (titleY - 62) * self.progress).toFixed(6)
        titleEl.style.transform = [
          `scale(${titleScaleX.toFixed(6)}, ${titleScaleY.toFixed(6)})`,
          `translate(var(--tw-translate-x), ${y}px)`,
        ].join(' ')
      },
    })

    const titleShrink = scrollTrigger.create({
      scrub: true,
      trigger: '#section-events',
      start: 'bottom top',
      endTrigger: '#galleries-fill',
      end: `top bottom`,
      onUpdate: (self) => {
        const scaleX = titleScaleX - (titleScaleX - 1) * self.progress
        const scaleY = titleScaleY - (titleScaleY - 1) * self.progress
        const y = (62 - 62 * self.progress).toFixed(6)

        titleEl.style.transform = [
          `scale(${scaleX.toFixed(6)}, ${scaleY.toFixed(6)})`,
          `translate(var(--tw-translate-x), ${y}px)`,
        ].join(' ')
      },
    })

    observer.observe(stickyEl)

    return () => {
      observer.disconnect()
      outer.kill()
      inner.kill()
      depth.kill()
      state.kill()
      fade.kill()
      canvas.kill()
      titleShrink.kill()
      titleDepth.kill()
    }
  }, [activeIndex, onStartCallback, onStopCallback, scrollTrigger])

  return (
    <div
      className={!scrollTrigger ? 'py-3 lg:py-5' : 'mt-[-100lvh] h-[250lvh]'}
    >
      <div
        ref={stickyRef}
        className={tw(
          'sticky top-0 min-h-[518px] overflow-hidden md:min-h-[312px] lg:min-h-[506px] xs-max:min-h-[444px]',
          scrollTrigger && 'h-screen'
        )}
      >
        <div className='absolute left-0 top-1/2 h-[494px] w-full -translate-y-1/2 md:h-[312px] lg:h-[506px] xs-max:h-[444px]'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default ParallaxEffect
