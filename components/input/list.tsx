'use client'

import type { InputProps } from '@/components/input'
import { useRef } from 'react'
import { X } from 'lucide-react'
import { tw } from '@/lib'
import { useValidator } from '@/hooks/validator'
import ButtonIcon from '@/components/button/icon'
import Input from '@/components/input'

type ListInputProps = Omit<InputProps, 'autoFocus'> & {
  rootClasses?: string
  onClear?: (inputEl: HTMLInputElement) => void
}

const ListInput: RF<ListInputProps> = ({
  ref,
  type,
  className,
  rootClasses,
  children,
  onClear,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const validator = useValidator(ref ?? inputRef, props.schema)

  if (!props.defaultValue && type?.includes('date')) {
    throw new Error('Please provide defaultValue for type="date"')
  }

  return (
    <div className={tw('relative w-full', rootClasses)}>
      <Input
        {...props}
        ref={ref ?? inputRef}
        type={type ?? 'text'}
        className={tw(
          'inline-flex min-h-10 items-center pl-4 pr-10 outline-none placeholder-shown:pr-4 read-only:pr-4',
          '[[type^=date]&]:bg-transparent [[type^=date]&]:pr-4',
          '[[type^=search]&]:bg-zinc-200/50 [[type^=search]&]:pr-4',
          className
        )}
      />
      <ButtonIcon
        tabIndex={-1}
        aria-label='Hapus teks'
        className='group/input-clear absolute right-0 top-0 h-full w-10 outline-none focus-visible:ring-0 peer-placeholder-shown:hidden peer-read-only:hidden peer-[[type=search]]:hidden peer-[[type^=date]]:hidden'
        onClick={(e) => {
          const { previousElementSibling: input } = e.currentTarget

          if (input instanceof HTMLInputElement) {
            input.value = ''
            input.focus()

            validator.validate({ current: input }, props.schema)
            onClear?.(input)
          }
        }}
      >
        <span
          className={tw(
            'inline-flex size-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-600',
            'group-hover/input-clear:bg-zinc-200 group-focus-visible/input-clear:ring'
          )}
        >
          <X size={12} />
        </span>
      </ButtonIcon>
      {children}
    </div>
  )
}

export default ListInput
