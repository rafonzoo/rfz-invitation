import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

type DialogProps = {
  root?: Dialog.DialogProps
  trigger?: Dialog.DialogTriggerProps
  overlay?: Dialog.DialogOverlayProps
  content?: Dialog.DialogContentProps
  close?: Dialog.DialogCloseProps
  title?: Dialog.DialogTitleProps
  description?: Dialog.DialogDescriptionProps
}

const DialogBase: RF<DialogProps> = ({
  children,
  root,
  trigger,
  overlay,
  content,
  close,
}) => {
  return (
    <Dialog.Root {...root}>
      <Dialog.Trigger {...trigger} />
      <Dialog.Portal>
        <Dialog.Overlay {...overlay} />
        <Dialog.Content {...content}>
          <Dialog.Close {...close} />
          <VisuallyHidden.Root>
            <Dialog.Title />
            <Dialog.Description />
          </VisuallyHidden.Root>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export type { DialogProps }

export default DialogBase
