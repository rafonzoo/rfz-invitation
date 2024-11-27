'use client'

import type { DialogProps } from '@/components/dialog'
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useContext, useRef } from 'react'
import { tw } from '@/lib'
import { presentationHydration } from '@/core/helpers'
import { PresentationContext } from '@/components/presentation/provider'
import Safearea from '@/components/layout/safearea'

type PresentationProps = DialogProps & {
  wrapperClasses?: string
  beforeContent?: React.ReactNode
  disableSafearea?: boolean
  locked?: boolean
  mandatory?: boolean
}

const selector = {
  root: '[data-dialog=presentation]',
  inner: 'inner-frame',
  outer: 'outer-frame',
  view: 'view-presentation',
  open: 'open-presentation',
  close: 'close-presentation',
  overlay: 'overlay-presentation',
} as const

const Presentation: RF<PresentationProps> = ({
  children,
  root,
  trigger,
  overlay,
  content,
  close,
  title,
  description,
  wrapperClasses,
  beforeContent,
  disableSafearea,
  locked,
  mandatory,
}) => {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const sheets = useContext(PresentationContext)

  function isRunning() {
    return (
      document.body.classList.contains(selector.open) ||
      document.body.classList.contains(selector.close)
    )
  }

  function createObserver(target: HTMLElement) {
    const observer = new MutationObserver((list, obs) => {
      for (const mutation of list) {
        if (mutation.type !== 'attributes') {
          return
        }

        const current = mutation.target as HTMLElement
        const attribute = mutation.attributeName

        if (!attribute || attribute !== 'data-state') {
          return
        }

        if (current.getAttribute(attribute) !== 'closed') {
          return
        }

        // Delete then read before execute
        sheets.delete(target.id)

        const items = Array.from(sheets)
        const currentSheet = items[sheets.size - 1]
        const collapseItem = items[sheets.size - 2]

        // Revert active sheet
        if (currentSheet) {
          const [, lastSheet] = currentSheet

          lastSheet.removeAttribute('data-presentation-state')
          lastSheet.classList.remove(
            tw('scale-[.9179487]'),
            tw('-translate-y-2.5'),
            tw('md:translate-y-[calc(-50%_-_10px)]'),
            tw('data-[dialog]:md:!transform-none')
          )
        }

        // Revert the collapsed item to shrinked item
        if (collapseItem) {
          const [, collapsedElement] = collapseItem

          collapsedElement.setAttribute('data-presentation-state', 'shrink')
          collapsedElement.classList.remove(
            tw('!scale-[.87]'),
            tw('!translate-y-0'),
            tw('md:!-translate-y-1/2')
          )
        }

        // Remove data-presentation if active sheet is 0
        // prettier-ignore
        if (!(sheets.size - 1)) {
          document.body.removeAttribute('data-presentation') } else {
          document.body.setAttribute('data-presentation', `${sheets.size - 1}`)
        }

        document.body.classList.add(selector.close)
        obs.disconnect()
      }
    })

    observer.observe(target, { attributes: true })
    document.body.classList.add(selector.open)
  }

  function showPresentation(e: Event) {
    content?.onOpenAutoFocus?.(e)
    const sheet = e.target as HTMLElement

    if (e.defaultPrevented) {
      closeRef.current?.focus()
    }
    // Prevent fast action
    if (isRunning()) return e.preventDefault()

    // Update the map for counter
    sheets.set(sheet.id, sheet)

    // Attach observer to detect close state
    createObserver(sheet)

    // Get element which should be shrink/collapsed
    const items = Array.from(sheets)
    const shrinkedItem = items[sheets.size - 2]
    const collapseItem = items[sheets.size - 3]

    if (shrinkedItem) {
      const [, shrinkedElement] = shrinkedItem

      shrinkedElement.setAttribute('data-presentation-state', 'shrink')
      shrinkedElement.classList.add(
        tw('scale-[.9179487]'),
        tw('-translate-y-2.5'),
        tw('transition-transform'),
        tw('duration-300'),
        tw('origin-top'),
        tw('will-change-transform'),
        tw('md:duration-[400ms]'),
        tw('md:translate-y-[calc(-50%_-_10px)]'),
        tw('data-[dialog]:md:!transform-none')
      )
    }

    if (collapseItem) {
      const [, collapsedElement] = collapseItem

      collapsedElement.setAttribute('data-presentation-state', 'collapse')
      collapsedElement.classList.add(
        tw('!scale-[.87]'),
        tw('!translate-y-0'),
        tw('md:!-translate-y-1/2')
      )
    }

    document.body.classList.add(selector.view)
    document.body.setAttribute('data-presentation', `${sheets.size - 1}`)
  }

  function closePresentation(e: Event) {
    content?.onCloseAutoFocus?.(e)

    const items = Array.from(sheets)
    const isEndOfAnimation = sheets.size === 1

    // Only perform if all sheet is collapsed
    if (isEndOfAnimation) {
      const [, rootElement] = items[sheets.size - 1]

      rootElement.classList.remove(
        tw('transition-transform'),
        tw('origin-top'),
        tw('will-change-transform'),
        tw('duration-300'),
        tw('md:duration-[400ms]')
      )

      document.body.classList.remove(selector.view)
    }

    document.body.classList.remove(selector.open, selector.close)
    presentationHydration(sheets) // Hydration checker. Optional
  }

  function preventDefault(cbFn?: (e: any) => void) {
    return (e: any) => {
      if (isRunning() || locked) {
        e.preventDefault()
      }

      if (mandatory && e.type !== 'click') {
        e.preventDefault()
      }

      cbFn?.(e)
    }
  }

  function stopPropagation(cbFn?: (e: any) => void) {
    return (e: any) => {
      e.stopPropagation()

      cbFn?.(e)
      document.body.classList.remove(selector.open, selector.close)
    }
  }

  return (
    <Dialog.Root {...root}>
      {!!trigger && (
        <Dialog.Trigger
          {...trigger}
          onClick={preventDefault(trigger.onClick)}
        />
      )}
      <Dialog.Portal>
        {/* Test hidration problem with uncomment below, then resave */}
        {/* <div></div> */}
        <Dialog.Overlay
          {...overlay}
          className={tw(
            'overlay fixed bottom-0 left-0 right-0 top-0 z-[997] bg-black',
            'data-[state="open"]:animate-presentation-overlay-fade-in',
            'data-[state="closed"]:animate-presentation-overlay-fade-out',
            tw(selector.overlay, overlay?.className)
          )}
        />
        <Dialog.Content
          {...content}
          onOpenAutoFocus={showPresentation}
          onCloseAutoFocus={closePresentation}
          onAnimationEnd={stopPropagation(content?.onAnimationEnd)}
          onEscapeKeyDown={preventDefault(content?.onEscapeKeyDown)}
          onPointerDownOutside={preventDefault(content?.onPointerDownOutside)}
          className={tw(
            'fixed bottom-0 left-0 z-[997] flex h-full max-h-[calc(100%_-_26px)] w-full flex-col rounded-tl-field rounded-tr-field',
            'data-[state=closed]:animate-presentation-hide data-[state=open]:animate-presentation-show',
            'bg-zinc-100 dark:bg-zinc-900 dark:text-white',
            'md:left-1/2 md:top-1/2 md:h-175 md:max-h-[96%] md:w-118 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-bl-field md:rounded-br-field',
            'data-[state=closed]:md:animate-presentation-large-hide data-[state=open]:md:animate-presentation-large-show',
            content?.className
          )}
        >
          {/* Header */}
          <div className='w-full rounded-t-inherit bg-inherit'>
            <div className='flex h-14 w-full flex-col items-center justify-center'>
              {description ? (
                <Dialog.Description />
              ) : (
                <VisuallyHidden.Root>
                  <Dialog.Description />
                </VisuallyHidden.Root>
              )}
              {title ? (
                <Dialog.Title
                  {...title}
                  className={tw(
                    'mx-auto items-center text-center font-semibold',
                    title.className
                  )}
                />
              ) : (
                <VisuallyHidden.Root>
                  <Dialog.Title />
                </VisuallyHidden.Root>
              )}
            </div>
            {beforeContent}
          </div>
          {/* Content */}
          <div
            className={tw(
              'mx-auto flex h-full w-full max-w-118 flex-col flex-nowrap overflow-auto overflow-x-hidden before:table after:table',
              !wrapperClasses?.includes('before:my-') ? 'before:my-2' : '',
              !wrapperClasses?.includes('after:my-') ? 'after:my-4' : '',
              wrapperClasses
            )}
          >
            {disableSafearea ? children : <Safearea>{children}</Safearea>}
          </div>
          {/* Required */}
          <Dialog.Close
            {...close}
            ref={closeRef}
            disabled={close?.disabled || locked}
            onClick={preventDefault(close?.onClick)}
            className={tw(
              'absolute left-3 top-4 disabled:opacity-40',
              close?.className
            )}
          >
            {close?.children ?? 'Tutup'}
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export type { PresentationProps }

export default Presentation
