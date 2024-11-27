'use client'

import { usePathname, useSelectedLayoutSegments } from 'next/navigation'
import { createContext, useEffect, useRef, useState } from 'react'

// @ts-expect-error polyfill
import groupby from 'object.groupby'

// @ts-expect-error polyfill
import hasOwn from 'object.hasown'

if (!Object.hasOwn) hasOwn.shim()
if (!Object.groupBy) groupby.shim()

export const PresentationContext = createContext<Map<string, HTMLElement>>(
  undefined!
)

const PresentationProvider: RF = ({ children }) => {
  const [sheets] = useState(() => new Map<string, HTMLElement>())
  const pathname = usePathname()
  const segments = useSelectedLayoutSegments()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const { root, inner } = {
      root: rootRef.current,
      inner: innerRef.current,
    }

    if (!root || !inner) {
      return
    }

    // Capture default class before it gets updated
    const capturedClasses = root.className

    if (root) {
      sheets.set('container', root)
    }

    return () => {
      sheets.clear()

      // Revert root class to captured
      root.setAttribute('class', capturedClasses)

      // Remove all attribute used for the state
      root.removeAttribute('data-presentation-state')

      // Also remove the inner attribute used for styling
      inner.removeAttribute('data-presentation')
    }
  }, [sheets, pathname, segments.length])

  return (
    <PresentationContext.Provider value={sheets}>
      <div
        id='outer-frame'
        className='pointer-events-none fixed bottom-0 left-0 right-0 top-0 -z-1 hidden bg-black md:hidden [.view-presentation_&]:block'
      />
      <div
        ref={innerRef}
        id='inner-frame'
        className='pointer-events-none invisible fixed inset-[16px_4.082051%] z-[996] scale-[1.1] rounded-field shadow-[0_0_0_100px_#000] transition-transform duration-300 will-change-transform md:hidden [.view-presentation[data-presentation="1"]_&]:scale-100 [.view-presentation[data-presentation]:not([data-presentation="1"])_&]:scale-[0.967] [.view-presentation_&]:visible'
      />
      <div
        ref={rootRef}
        data-dialog='presentation'
        className='dark:bg-zinc-900 dark:text-white'
      >
        {children}
      </div>
    </PresentationContext.Provider>
  )
}

export default PresentationProvider
