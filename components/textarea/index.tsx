'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { tw } from '@/lib'
import { useValidator } from '@/hooks/validator'

type TextAreaProps = TAG<'textarea'> & {
  disableSubmitLoading?: boolean
}

const Textarea: RFZ<TextAreaProps> = ({
  ref,
  className,
  disabled,
  schema,
  disableSubmitLoading = false,
  ...props
}) => {
  const { pending } = useFormStatus()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const validator = useValidator(ref ?? textareaRef, schema)
  const isDisabledOrLoading = disabled || (!disableSubmitLoading && pending)

  return (
    <textarea
      {...props}
      ref={ref ?? textareaRef}
      disabled={isDisabledOrLoading}
      onChange={validator.track(props)}
      className={tw(
        'peer w-full appearance-none bg-white px-4 py-2 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
    />
  )
}

export default Textarea
