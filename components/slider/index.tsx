import * as RadixSlider from '@radix-ui/react-slider'
import { tw } from '@/lib'

type SliderProps = {
  root?: RadixSlider.SliderProps
  track?: RadixSlider.SliderTrackProps
  range?: RadixSlider.SliderRangeProps
  thumb?: RadixSlider.SliderThumbProps
}

const Slider: RFZ<SliderProps> = ({ root, track, range, thumb }) => {
  return (
    <RadixSlider.Root
      {...root}
      className={tw('relative flex h-5 w-full items-center', root?.className)}
    >
      <RadixSlider.Track
        {...track}
        className={tw(
          'block h-0.5 w-full rounded-full bg-zinc-200',
          track?.className
        )}
      >
        <RadixSlider.Range
          {...range}
          className={tw(
            'absolute h-0.5 rounded-full bg-primary',
            range?.className
          )}
        />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        {...thumb}
        className={tw(
          'block size-5 rounded-full border border-zinc-200 bg-white shadow-lg outline-none focus-visible:ring',
          thumb?.className
        )}
      />
    </RadixSlider.Root>
  )
}

export default Slider
