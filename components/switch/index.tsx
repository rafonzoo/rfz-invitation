'use client'

import { useRef } from 'react'
import { tw } from '@/lib'
import Button, { type ButtonProps } from '@/components/button'

type SwitchProps = ButtonProps & {
  defaultChecked?: boolean
  checked?: boolean
  required?: boolean
  name?: string
  onValueChange?: (value: boolean) => void
}

const Switch: RFZ<SwitchProps> = ({
  defaultChecked,
  checked,
  required,
  name,
  onValueChange,

  disabled,
  id,
  className,
  onClick,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  function toggleSwitch(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e)

    // In case parent is a tap-able
    e.stopPropagation()

    if (e.defaultPrevented || !inputRef.current) {
      return
    }

    inputRef.current.checked = !inputRef.current.checked
  }

  return (
    <>
      <input
        {...{ defaultChecked, checked, required, id, disabled }}
        name={name ?? id}
        ref={inputRef}
        tabIndex={-1}
        type='checkbox'
        onChange={(e) => onValueChange?.(e.target.checked)}
        className='peer/switch sr-only pointer-events-none'
      />
      <Button
        {...props}
        type='button'
        aria-label={props['aria-label'] ?? 'Toggle switch'}
        onClick={toggleSwitch}
        className={tw(
          'inline-flex h-[26px] w-10 items-center rounded-full bg-black/10 px-0.5 text-left outline-none transition-colors hover:bg-black/20 focus-visible:ring',
          'after:pointer-events-none after:inline-block after:size-[22px] after:rounded-full after:bg-white after:transition-transform after:duration-300',
          'peer-checked/switch:bg-green-500 peer-checked/switch:after:translate-x-3.5',
          className
        )}
      ></Button>
    </>
  )
}

export default Switch
