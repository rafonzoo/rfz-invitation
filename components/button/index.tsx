'use client'

import { useFormStatus } from 'react-dom'
import { tw } from '@/lib'

export type ButtonProps = TAG<'button'> & {
  disableSubmitLoading?: boolean
}

const Button: RFZ<ButtonProps> = ({
  className,
  disabled,
  disableSubmitLoading = false,
  ...props
}) => {
  const { pending } = useFormStatus()
  const isDisabledOrLoading = disabled || (!disableSubmitLoading && pending)

  return (
    <button
      {...props}
      disabled={isDisabledOrLoading}
      className={tw(
        'appearance-none disabled:pointer-events-none disabled:opacity-40',
        'group-aria-disabled/tapview:opacity-100', // Opacity handled by tapview
        className
      )}
    />
  )
}

export default Button
