'use client'

import type { PresentationProps } from '@/components/presentation'
import { Loader } from 'lucide-react'
import { updateTransaction } from '@/feat/invitation/action'
import Button from '@/components/button'
import Presentation from '@/components/presentation'
import Toast from '@/lib/toast'

type PaymentLinkProps = Pick<PresentationProps, 'root' | 'content'> & {
  pid: string
  url: string
  dismissable?: boolean
  onSuccessCallback?: () => void
  onFailureCallback?: () => void
  onCancelCallback?: () => void
}

const InvitationEditorPayment: RF<PaymentLinkProps> = ({
  pid = '',
  url = '',
  dismissable,
  onSuccessCallback,
  onFailureCallback,
  onCancelCallback,
  children,
  ...dialog
}) => {
  async function validateInvoice(formData: FormData) {
    const { data, errorMessage } = await updateTransaction(formData)

    if (!data) {
      return Toast.error(errorMessage)
    }

    if (data.expired) {
      dialog.root?.onOpenChange?.(false)
      onFailureCallback?.()

      return Toast.warn(errorMessage)
    }

    if (data.success) {
      dialog.root?.onOpenChange?.(false)
      return onSuccessCallback?.()
    }

    Toast.warn(errorMessage)
  }

  return (
    <Presentation
      {...dialog}
      mandatory={true}
      disableSafearea
      title={{ children: 'Bayar' }}
      trigger={{ asChild: true, children }}
      wrapperClasses='before:my-0 after:my-0'
      close={{
        disabled: !pid,
        onClick: (e) => {
          // Cancelable if PID not detected / can dismiss.
          if (!pid || dismissable) return

          // prettier-ignore
          if (window.confirm('Tunda pembayaran?\n\nPembayaran dapat dilanjutkan melalui menu transaksi sebelum waktu kadaluarsa.')) {
            return onCancelCallback?.()
          }

          e.preventDefault()
        },
      }}
    >
      <div className='h-full w-full'>
        {pid ? (
          <>
            {url && <iframe src={url} className='h-full w-full' />}
            <form action={validateInvoice} className='absolute right-3 top-4'>
              <input type='hidden' name='pid' value={pid} />
              <Button className='text-primary'>Periksa</Button>
            </form>
          </>
        ) : (
          <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
            <Loader className='animate-spin opacity-40' />
          </span>
        )}
      </div>
    </Presentation>
  )
}

export default InvitationEditorPayment
