/**
 * amount: 59_000
 *
 * a => without digit -> 59
 *
 * aa => with digits -> 59.000
 *
 * c => with currency -> Rp.
 *
 * cc => with currency -> IDR.
 *
 * t => tail K -> ..k
 *
 * tt => tail Rb -> ..rb
 *
 * ttt => tail full -> ..rupiah
 */
export const formatRupiah = (amount: number, template = '') => {
  return (template || 'cc aa')
    .replace(/aa/g, amount.toLocaleString('id-ID'))
    .replace(/a/g, (amount / 1000).toString())
    .replace(/cc/g, 'IDR.')
    .replace(/c/g, 'Rp.')
    .replace(/tttt/g, 'rupiah')
    .replace(/ttt/g, 'ribu')
    .replace(/tt/g, 'rb')
    .replace(/t/g, 'k')
}

export const cloneMaxArray = <T extends unknown[]>(array: T, min = 5) => {
  if (array.length <= 0) return array
  let arr: unknown[] = array

  while (arr.length < min) {
    arr = [...arr, ...array]
  }

  return arr.slice(0, min) as T
}

export const isVideoExtension = (str?: string) => {
  return !str || str.length <= 5
    ? false
    : ['.mp4', '.webm', '.ogg'].some((format) => str.slice(-5).includes(format))
}

export const markdownSource = (text: string, simplified = false) => {
  let pattern = /(\*.[^\*]*\*|__.[^_]*__)/g
  let matcher = text.match(pattern)

  if (matcher) {
    text = text
      .split(' ')
      .map((str) => (str.match(pattern) ? str.replace(/(\*\*|__)/g, '') : str))
      .join(' ')

    const patch = matcher.map((item) => ({
      before: item,
      after: item.replace(/(\*\*|\*)/g, simplified ? '*' : '**'),
    }))

    for (let i = 0; i < patch.length; i++) {
      text = text.replace(patch[i].before, patch[i].after)
    }
  }

  return text
}

export const presentationHydration = (sheets: Map<string, HTMLElement>) => {
  const presentation = document.body.getAttribute('data-presentation')
  const dialog = document.querySelectorAll<HTMLElement>('[role=dialog]')
  const op = !!(presentation && +presentation > dialog.length)
  const root = document.querySelector<HTMLElement>('[data-dialog=presentation]')
  const lastDialog: HTMLElement | null = dialog[dialog.length - 1] ?? root

  if (!op || !root || !lastDialog) {
    return
  }

  sheets.clear()
  sheets.set('container', root)

  if (dialog[0]) {
    sheets.set(dialog[0].id, dialog[0])
  }

  root.setAttribute('data-presentation-state', 'shrink')
  root.classList.remove(
    '!scale-[.87]',
    '!translate-y-0',
    'md:!-translate-y-1/2'
  )

  lastDialog.removeAttribute('data-presentation-state')
  lastDialog.classList.remove(
    'scale-[.9179487]',
    '-translate-y-2.5',
    'transition-transform',
    'duration-300',
    'origin-top',
    'will-change-transform',
    'md:duration-[400ms]',
    'md:translate-y-[calc(-50%_-_10px)]',
    'data-[dialog]:md:!transform-none',
    '!scale-[.87]',
    '!translate-y-0',
    'md:!-translate-y-1/2'
  )

  if (!dialog.length) {
    return document.body.removeAttribute('data-presentation')
  }

  document.body.setAttribute('data-presentation', `${dialog.length}`)
}

export const isPresentationRunning = () => {
  if (typeof window === 'undefined') return false

  return (
    document.body.classList.contains('open-presentation') ||
    document.body.classList.contains('close-presentation')
  )
}
