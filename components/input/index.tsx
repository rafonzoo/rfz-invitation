'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { tw } from '@/lib'
import { useValidator } from '@/hooks/validator'

export type InputProps = TAG<'input'> & {
  disableSubmitLoading?: boolean
}

const Input: RF<InputProps> = ({
  ref,
  className,
  disabled,
  schema,
  autoFocus,
  disableSubmitLoading = false,
  ...props
}) => {
  const { pending } = useFormStatus()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const validator = useValidator(ref ?? inputRef, schema)
  const isDisabledOrLoading = disabled || (!disableSubmitLoading && pending)

  return (
    <input
      {...props}
      ref={ref ?? inputRef}
      disabled={isDisabledOrLoading}
      onChange={validator.track(props)}
      className={tw(
        'peer w-full min-w-24 appearance-none bg-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
    />
  )
}

export default Input
