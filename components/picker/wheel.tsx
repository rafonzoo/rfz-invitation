'use client'

import type {
  KeenSliderHooks,
  KeenSliderInstance,
  KeenSliderOptions,
  TrackDetails,
} from 'keen-slider/react'
import { useEffect, useId, useRef, useState } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import { tw } from '@/lib'
import '@/app/wheels.css'

type WheelProps = {
  initIdx?: number
  label?: string
  length: number
  loop?: boolean
  disabled?: boolean
  width?: number
  perspective?: 'left' | 'right' | 'center'
  itemClasses?: string
  setValue?: (relative: number, absolute: number) => string
  onWheelStart?: () => void
  onWheelStop?: (
    value: string,
    self: KeenSliderInstance<{}, {}, KeenSliderHooks>
  ) => void
}

const Wheel: RFZ<WheelProps> = ({
  length,
  initIdx,
  label,
  loop,
  disabled,
  itemClasses,
  perspective = 'center',
  width,
  setValue,
  onWheelStart,
  onWheelStop,
}) => {
  const id = useId().replace(/:/g, '')
  const wheelSize = 20
  const slides = length
  const slideDegree = 360 / wheelSize
  const slidesPerView = loop ? 9 : 1
  const [sliderState, setSliderState] = useState<TrackDetails | null>(null)
  const size = useRef(0)
  const options = useRef<KeenSliderOptions>({
    rubberband: !loop,
    mode: 'free-snap',
    vertical: true,
    disabled,
    initial: initIdx || 0,
    loop: loop,
    slides: {
      number: slides,
      origin: loop ? 'center' : 'auto',
      perView: slidesPerView,
    },

    dragSpeed: (val) => {
      const height = size.current
      return (
        val *
        (height /
          ((height / 2) * Math.tan(slideDegree * (Math.PI / 180))) /
          slidesPerView)
      )
    },
    created: (s) => (size.current = s.size),
    updated: (s) => (size.current = s.size),
    detailsChanged: (s) => setSliderState(s.track.details),
    animationStopped: callbackFn,
    animationEnded: callbackFn,
    animationStarted: () => onWheelStart?.(),
  })

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(options.current)
  const [radius, setRadius] = useState(0)

  useEffect(() => {
    if (slider.current) setRadius(slider.current.size / 2)
  }, [slider])

  function slideValues() {
    const offset = loop ? 1 / 2 - 1 / slidesPerView / 2 : 0
    const values = []

    if (!sliderState) return []
    for (let i = 0; i < slides; i++) {
      const distance = sliderState
        ? (sliderState.slides[i].distance - offset) * slidesPerView
        : 0
      const rotate =
        Math.abs(distance) > wheelSize / 2
          ? 180
          : distance * (360 / wheelSize) * -1
      const style = {
        transform: `rotateX(${rotate}deg) translateZ(${radius}px)`,
        WebkitTransform: `rotateX(${rotate}deg) translateZ(${radius}px)`,
      }
      const value = setValue
        ? setValue(i, sliderState.abs + Math.round(distance))
        : i

      values.push({ style, value })
    }

    return values
  }

  function callbackFn(slider: KeenSliderInstance<{}, {}, KeenSliderHooks>) {
    const activeIndex = slider.track.details.rel
    const target = document.querySelectorAll<HTMLElement>(
      `#wheel-${id} .wheel__slide`
    )

    onWheelStop?.(target[activeIndex]?.textContent ?? '', slider)
  }

  return (
    <div
      id={`wheel-${id}`}
      ref={sliderRef}
      className={'wheel keen-slider wheel--perspective-' + perspective}
      data-disabled={disabled ? 'true' : void 0}
    >
      <div
        className='wheel__shadow-top'
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`,
        }}
      />
      <div className='wheel__inner'>
        <div className='wheel__slides' style={width ? { width } : void 0}>
          {slideValues().map(({ style, value }, idx) => (
            <div
              className={tw('wheel__slide', itemClasses)}
              style={style}
              key={idx}
            >
              {value}
            </div>
          ))}
        </div>
        {label && (
          <div
            className='wheel__label'
            style={{
              transform: `translateZ(${radius}px)`,
              WebkitTransform: `translateZ(${radius}px)`,
            }}
          >
            {label}
          </div>
        )}
      </div>
      <div
        className='wheel__shadow-bottom'
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`,
        }}
      />
    </div>
  )
}

export default Wheel
