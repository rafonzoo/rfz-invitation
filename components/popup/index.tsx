'use client'

import * as Popover from '@radix-ui/react-popover'
import { tw } from '@/lib'

type PopupProps = {
  root?: Popover.PopoverProps
  trigger?: Popover.PopoverTriggerProps
  content?: Popover.PopoverContentProps
  close?: Popover.PopoverCloseProps
  triggerWrapperProps?: TAG<'div'>
}

const Popup: RF<PopupProps> = ({
  root,
  trigger,
  triggerWrapperProps,
  content,
  children,
}) => {
  return (
    <Popover.Root {...root}>
      {!!trigger && <Popover.Trigger {...trigger} />}
      <Popover.Portal>
        <Popover.Content
          {...content}
          className={tw(
            'z-[999] rounded-field bg-white p-3 shadow-2xl outline-none data-[state=closed]:animate-alert-hide data-[state=open]:animate-alert-show',
            content?.className
          )}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export type { PopupProps }

export default Popup
