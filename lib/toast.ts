import { tw } from '@/lib'

class ToastNotification {
  protected toasts = () => {
    return Array.from(
      document.querySelectorAll<HTMLElement>('[data-role="toast"]')
    )
  }

  protected create = (message: string, className?: string) => {
    const toastElement = document.createElement('div')
    const toastInner = document.createElement('div')

    toastElement.dataset.role = 'toast'
    toastElement.className = tw(
      'p-3 fixed top-0 whitespace-pre-line text-sm tracking-normal left-0 w-full -translate-y-full transition-transform duration-300 z-[1200]',
      className
    )

    toastInner.className = tw('mx-auto max-w-118 md:max-w-168 lg:max-w-245')
    toastInner.textContent = message

    document.body.appendChild(toastElement)
    toastElement.appendChild(toastInner)

    setTimeout(() => toastElement.classList.remove('-translate-y-full'), 20)
    return toastElement
  }

  // Show
  show = async (
    message?: string | null,
    severity?: 'error' | 'success' | 'info' | 'warning'
  ) => {
    if (!message) return

    await this.hide()
    const instance = this.create(
      message,
      tw(
        severity ?? 'bg-zinc-100',
        severity === 'warning' && 'bg-amber-300',
        severity === 'error' && 'bg-red-600 text-white',
        severity === 'success' && 'bg-green-600 text-white'
      )
    )

    await new Promise((res) => setTimeout(res, 5_000))
    instance.classList.add('-translate-y-full')
    instance.addEventListener('transitionend', (e) =>
      (e.currentTarget as HTMLElement)?.remove()
    )
  }

  hide = async () => {
    const _toast = this.toasts()
    const toast = _toast[_toast.length - 1]

    if (toast) {
      toast.className += tw(toast.className, '-translate-y-full')
      toast.addEventListener('transitionend', (e) =>
        (e.currentTarget as HTMLElement)?.remove()
      )
    }
  }

  error = (message?: string | null) => {
    this.show(message, 'error')
  }
  success = (message?: string | null) => {
    this.show(message, 'success')
  }
  warn = (message?: string | null) => {
    this.show(message, 'warning')
  }
}

const Toast = new ToastNotification()
export default Toast
