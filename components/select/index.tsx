'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { tw } from '@/lib'
import { useValidator } from '@/hooks/validator'

type SelectProps = Omit<TAG<'select'>, 'autoFocus'> & {
  disableSubmitLoading?: boolean
}

const Select: RFZ<SelectProps> = ({
  ref,
  className,
  disabled,
  schema,
  disableSubmitLoading = false,
  ...props
}) => {
  const { pending } = useFormStatus()
  const selectRef = useRef<HTMLSelectElement | null>(null)
  const validator = useValidator(ref ?? selectRef, schema)
  const isDisabledOrLoading = disabled || (!disableSubmitLoading && pending)

  return (
    <select
      {...props}
      ref={ref ?? selectRef}
      disabled={isDisabledOrLoading}
      onChange={validator.track(props)}
      className={tw(
        'peer flex h-10 w-full appearance-none bg-white px-4 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
        'after:block',
        className
      )}
    />
  )
}

export default Select
