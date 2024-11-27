import { useEffect, useRef } from 'react'
import { tw } from '@/lib'
import { useObserver } from '@/hooks/common'

type CarouselItemProps = {
  isActive: boolean
  isNext: boolean
  isPrev: boolean
  className?: string
  url: string
  index: number
  isDisabled?: boolean
  onSelected?: () => void
}

const CarouselItem: RFZ<CarouselItemProps> = ({
  isActive,
  isNext,
  isPrev,
  className,
  index,
  url,
  isDisabled,
  onSelected,
}) => {
  const { isIntersecting, setRef } = useObserver()
  const canvasRef = useRef<(HTMLCanvasElement | null)[]>([])

  useEffect(() => {
    const current = canvasRef.current.filter(Boolean)

    current.forEach((source) => {
      const canvas = source?.getContext('2d')
      if (!canvas) return

      canvas.beginPath()
      canvas.arc(42, 42, 32, 0, 2 * Math.PI, false)
      canvas.fill()

      canvas.globalCompositeOperation = 'source-out'
      canvas.beginPath()
      canvas.rect(0, 0, 42, 42)
      canvas.fill()
    })
  }, [])

  return (
    <a
      href='/#'
      onClick={(e) => {
        e.preventDefault()
        onSelected?.()
      }}
      className={tw(
        'absolute z-1 mx-1.5 inline-block h-[494px] w-[278px] md:h-[312px] md:w-[555px] lg:mx-2.5 lg:h-[506px] lg:w-[900px] xs-max:h-[444px] xs-max:w-[250px] [.disable-feature_&]:pointer-events-none',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:top-0 after:bg-black after:opacity-100 after:transition-opacity after:duration-600 after:will-change-opacity',
        isActive ? 'z-2 will-change-transform after:!opacity-0' : '',
        isNext ? 'nextitem origin-left after:!opacity-50' : '',
        isPrev ? 'previtem origin-right after:!opacity-50' : '',
        isDisabled && 'will-change-transform'
      )}
    >
      <div
        className={tw(
          'absolute left-0 top-0 h-full w-full overflow-hidden',
          className
        )}
      >
        <figure
          ref={setRef}
          style={isIntersecting ? { backgroundImage: `url(${url})` } : void 0}
          className={tw(
            'absolute left-0 top-0 flex h-full w-full items-center justify-center bg-zinc-800 bg-cover bg-center bg-no-repeat',
            'after:absolute after:bottom-0 after:left-0 after:right-0 after:top-0 after:bg-black/20',
            isActive && 'will-change-transform'
          )}
        />
        <div className='pointer-events-none absolute left-[-5%] top-0 h-full w-[110%] bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.7))] translate-z-0 md:hidden' />
        <div
          className={tw(
            'list-info absolute left-1/2 top-6 w-full max-w-[270px] origin-top-left -translate-x-1/2 text-center will-change-transform md:left-10 md:top-10 md:translate-x-0 md:text-left',
            'h-[82px] md:h-[97px] lg:h-[125px]'
          )}
        >
          <p className='text-sm font-semibold tracking-normal lg:text-base lg:-tracking-base'>
            The Galleries
          </p>
          <p className='text-huge-title font-thin -tracking-wide lg:text-colossal-title'>
            #{('0' + (index + 1)).slice(-2)}
          </p>
        </div>
      </div>
      {[
        'top-left origin-center left-0 top-0 scale-x-50 scale-y-50 -ml-4 -mt-4',
        'top-right origin-center right-0 top-0 -scale-x-50 scale-y-50 -mr-4 -mt-4',
        'bottom-right origin-center bottom-0 right-0 -scale-x-50 -scale-y-50 -mr-4 -mb-4',
        'bottom-left origin-center bottom-0 left-0 scale-x-50 -scale-y-50 -ml-4 -mb-4',
      ].map((itm, i) => (
        <canvas
          ref={(r) => void (canvasRef.current = [...canvasRef.current, r])}
          key={i}
          width={42}
          height={42}
          className={tw(
            'pointer-events-none absolute z-[3] opacity-100 will-change-transform',
            itm
          )}
        />
      ))}
    </a>
  )
}

export default CarouselItem
