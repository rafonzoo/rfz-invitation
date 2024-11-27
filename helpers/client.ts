// DO NOT IMPORT SERVER MODULE OR YOU WILL BE FIRED!

import { ValiError, flatten, parse, safeParse } from 'valibot'

export function getTitleFromRoute(route: string) {
  const routes = route.split('/')
  return routes[routes.length - 1] ?? ''
}

export function setValidity(el: React.LegacyRef<HTMLElement>, schema?: any) {
  const ref = el as React.MutableRefObject<HTMLInputElement | null>
  const target = ref.current
  const value = target?.value.trim()

  // Abort earlier if it isn't presents.
  if (!schema || !target) return

  // Force-valid the target.
  if (safeParse(schema, value).success) {
    return target.setCustomValidity('')
  }

  // prettier-ignore
  try { parse(schema, value) }

  // Avoid another error outside valibot
  catch(e) {
    if (!(e instanceof ValiError)) return

    // Only take the first message, clear it otherwise
    target.setCustomValidity(flatten(e.issues).root?.[0] ?? '')
  }
}

export function sanitizeInput<T extends HTMLElement>(
  {
    pattern = '',
    exclude = '__',
    props = {},
  }: {
    pattern?: string
    exclude?: string
    props?: {
      onKeyDown?: (e: React.KeyboardEvent<T>) => void
      onPaste?: (e: React.ClipboardEvent<T>) => void
    }
  } = { pattern: '', exclude: '', props: {} }
) {
  // ;/?:@&=+$_<>!~*'#[]_{}
  const regex = `a-zA-Z0-9 ,.\\-()`.replace(exclude, '') + pattern

  return {
    onKeyDown: (e: React.KeyboardEvent<T>) => {
      const ptrn = new RegExp(`[${regex}]`, 'g')
      if (!e.key.match(ptrn) && e.key.length === 1) {
        e.preventDefault()
      }
      props?.onKeyDown?.(e)
    },
    onPaste: (e: React.ClipboardEvent<T>) => {
      const text = e.clipboardData.getData('text')
      const invert = new RegExp(`[^${regex}]`, 'g')
      if (invert.test(text)) {
        e.preventDefault()
      }
      props?.onPaste?.(e)
    },
  }
}
