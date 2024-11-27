import { tw } from '@/lib'
import SytemTextarea from '@/components/textarea'

type TextareaProps = TAG<'textarea'> & {
  placeholder: string
  divProps?: TAG<'div'>
}

const FloatingTextarea: RFZ<TextareaProps> = ({
  ref,
  placeholder,
  divProps,
  ...props
}) => {
  return (
    <div {...divProps} className={tw('relative', divProps?.className)}>
      <SytemTextarea
        {...props}
        ref={ref}
        placeholder={placeholder}
        className={tw(
          'flex min-h-72 w-full rounded-lg border border-zinc-200 !px-3 pt-[30px] text-base -tracking-base ring-offset-white',
          'placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950',
          'dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300',
          props.className
        )}
      />
      <span
        className={tw(
          'pointer-events-none absolute left-4 top-5 origin-top-left -translate-x-[3px] -translate-y-2.5 scale-[0.7] opacity-50',
          'peer-placeholder-shown:translate-x-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100',
          'peer-focus:-translate-x-[3px] peer-focus:-translate-y-2.5 peer-focus:scale-[0.7] peer-focus:opacity-100',
          'transition-transform duration-300 ease-default dark:text-white'
        )}
      >
        {placeholder}
      </span>
    </div>
  )
}

export default FloatingTextarea
