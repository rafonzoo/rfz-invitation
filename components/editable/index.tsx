'use client'

import { useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { tw } from '@/lib'

type EditableProps = Omit<
  TAG<'div'>,
  'contentEditable' | 'suppressContentEditableWarning'
> & {
  name?: string
}

const Editable: RFZ<EditableProps> = ({
  className,
  children,
  name,
  ...props
}) => {
  const { pending } = useFormStatus()
  const isDisabled = !!props['aria-disabled'] || pending

  useEffect(() => {
    if (isDisabled) {
      window.getSelection()?.removeAllRanges()
    }
  }, [isDisabled])

  function onInput(e: React.FormEvent<HTMLDivElement>) {
    if (isDisabled) {
      return e.preventDefault()
    }

    // Check if event is prevent as default
    props.onInput?.(e)

    if (e.defaultPrevented) {
      return
    }

    const target = e.currentTarget
    const input = target.previousSibling

    if (input instanceof HTMLInputElement) {
      input.value = target.innerText
    }
  }

  return (
    <>
      {!!name && typeof children === 'string' && (
        <input type='hidden' name={name} value={children} />
      )}
      <div
        {...props}
        suppressContentEditableWarning
        contentEditable
        aria-disabled={isDisabled}
        onInput={onInput}
        className={tw(
          'whitespace-pre-wrap aria-disabled:opacity-40',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

export default Editable
