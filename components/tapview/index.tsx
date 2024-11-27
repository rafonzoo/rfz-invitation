'use client'

import { useFormStatus } from 'react-dom'
import { tw } from '@/lib'

const Tapview: RFZ<Omit<TAG<'div'>, 'prefix' | 'role'>> = ({
  className,
  tabIndex,
  ...props
}) => {
  const { pending } = useFormStatus()
  const readonly = props['aria-readonly']
  const controlId = props['aria-controls']
  const disabled = props['aria-disabled']
  const isDisabled = !!disabled || pending
  const hasAction = (!!controlId || !!props.onClick) && !readonly

  function makeAsButton(e: React.KeyboardEvent<HTMLDivElement>) {
    props.onKeyDown?.(e)

    if (e.defaultPrevented || isDisabled || readonly) {
      return
    }

    if (!['Enter', 'Space'].includes(e.code)) {
      return
    }

    e.currentTarget?.click()
  }

  function clickWrapper(e: React.MouseEvent<HTMLDivElement>) {
    if (isDisabled || readonly) return

    // Check preventDefault is called from previous
    props.onClick?.(e)

    if (e.defaultPrevented) {
      return
    }

    controlId && document.getElementById(controlId)?.click()
  }

  return (
    <div
      {...props}
      role={hasAction ? 'button' : void 0}
      tabIndex={isDisabled ? -1 : !hasAction ? -1 : (tabIndex ?? 0)}
      aria-disabled={isDisabled}
      onKeyUp={makeAsButton}
      onClick={clickWrapper}
      className={tw(
        'group/tapview before:table after:table',
        'aria-disabled:cursor-auto aria-disabled:select-none aria-disabled:opacity-40',
        hasAction && 'select-none aria-[disabled=false]:hover:bg-zinc-200/75 aria-[disabled=false]:focus-visible:bg-zinc-200/75', // prettier-ignore
        className
      )}
    />
  )
}

export default Tapview
