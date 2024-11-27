'use client'

import type { Invoice } from 'xendit-node/invoice/models'
import { useState } from 'react'
import { serialize, tw } from '@/lib'
import { capitalize } from '@/core/utils'
import { formatRupiah } from '@/core/helpers'
import { Routes } from '@/core/config'
import { removeTransaction } from '@/feat/invitation/action'
import { formattedSlug } from '@/feat/invitation/helpers'
import ListGroup from '@/components/list/group'
import Presentation from '@/components/presentation'
import Tapview from '@/components/tapview'
import ListItem from '@/components/list/item'
import Button from '@/components/button'
import LazyImage from '@/feat/invitation/components/image/lazy'
import InvitationEditorPayment from '@/feat/invitation/pages/editor/payment'
import DayJS from '@/lib/dayjs'
import Toast from '@/lib/toast'

type InvitationTransactionDetailProps = Invoice & {
  pid: string
  onPurchaseChange: () => void
}

type TransactionDetailHeaderProps = {
  title: string
  price: number
  metaImage: string
  enableLazy?: boolean
}

const TransactionDetailHeader: RF<TransactionDetailHeaderProps> = ({
  title,
  price,
  metaImage,
  children,
  enableLazy,
}) => {
  return (
    <div className='flex flex-nowrap px-4 pt-3'>
      <div
        className={tw(
          'relative mr-2.5 inline-flex size-11 items-center justify-center overflow-hidden',
          metaImage ? 'rounded-field' : ''
        )}
      >
        {metaImage ? (
          <LazyImage
            src={metaImage}
            alt='Meta image'
            className='absolute left-0 top-0 h-full w-full object-center'
          />
        ) : (
          <LazyImage
            enable={enableLazy ?? true}
            src='/assets/img/placeholder-icon.png'
            alt='Placeholder'
          />
        )}
      </div>
      <div className='flex w-0 flex-grow flex-nowrap justify-between'>
        <div className='w-0 flex-grow'>
          <p className='truncate'>{title}</p>
          <p className='truncate text-sm tracking-normal text-zinc-500'>
            {children}
          </p>
        </div>
        <p className='ml-3'>{formatRupiah(price, 'c att')}</p>
      </div>
    </div>
  )
}

const InvitationTransactionDetail: RFZ<InvitationTransactionDetailProps> = ({
  expiryDate,
  invoiceUrl,
  amount,
  status,
  updated,
  created,
  externalId,
  customer,
  id: invoiceId = '',
  paymentMethod = '',
  fees = [],
  items = [],
  onPurchaseChange,
}) => {
  const [open, onOpenChange] = useState(false)
  const [payNow, setPayNow] = useState(false)
  const [locked, setLocked] = useState(false)
  const [{ name: title, price, category = '' }] = items
  const [tier, slug] = category.split(':')
  const isPending = status === 'PENDING'
  const isExpired = status === 'EXPIRED'
  const isSuccess = ['PAID', 'SETTLED'].includes(status)

  async function removePurchaseAction() {
    // prettier-ignore
    if (!window.confirm('Batalkan transaksi ini?\n\nTransaksi akan dibatalkan dan dihapus dari daftar riwayat transaksi.')) {
      return
    }

    setLocked(true)
    const { errorMessage: purchaseError } = await removeTransaction(
      serialize({
        type: 'invitation',
        pid: externalId,
        path: Routes.invitationTransaction,
      })
    )

    setLocked(false)
    if (purchaseError) {
      return Toast.error(purchaseError)
    }

    onOpenChange(false)
    Toast.success('Transaksi berhasil dibatalkan!')
  }

  return (
    <ListGroup disablePeerList>
      <Presentation
        {...{ locked }}
        root={{ open, onOpenChange }}
        title={{ children: 'Pembayaran' }}
        content={{ onCloseAutoFocus: onPurchaseChange }}
        trigger={{
          asChild: true,
          children: (
            <Tapview aria-readonly={isExpired}>
              <TransactionDetailHeader {...{ title, price, metaImage: '' }}>
                {formattedSlug(slug)}
              </TransactionDetailHeader>
              <hr className='mt-5' />
              <ListItem
                withChevron={!isExpired}
                suffix={
                  ['PENDING', 'EXPIRED'].some((stats) => stats === status) && (
                    <div className='flex flex-nowrap items-center space-x-1'>
                      {isPending && (
                        <span className='inline-flex size-4 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold text-black'>
                          !
                        </span>
                      )}
                      <p
                        className={isExpired ? 'text-red-500' : 'text-zinc-500'}
                      >
                        {capitalize(status.toLowerCase())}
                      </p>
                    </div>
                  )
                }
              >
                Pembayaran
              </ListItem>
            </Tapview>
          ),
        }}
      >
        {isPending && (
          <div className='mb-8 flex rounded-field bg-white px-4 py-3'>
            <div className='mr-3 mt-1 size-6 rounded-md'>
              <span className='inline-flex size-6 items-center justify-center rounded-full bg-yellow-400 font-semibold text-black'>
                !
              </span>
            </div>
            <div className='w-0 flex-grow'>
              <p className='truncate font-semibold'>Menunggu pembayaran</p>
              <p className='mt-0.5 text-sm tracking-normal'>
                Paket {capitalize(tier)} segera aktif setelah pembayaran
                berhasil.
              </p>
            </div>
          </div>
        )}
        <ListGroup>
          <TransactionDetailHeader
            {...{ title, price, metaImage: '' }}
            enableLazy={false}
          >
            {formattedSlug(slug)}
            <br />
            {isSuccess ? 'Berhasil' : capitalize(status.toLowerCase())}
            <br />
            {DayJS(created).tz().format('D MMM YYYY HH:mm')}
          </TransactionDetailHeader>
          <div className='mt-5 px-4 pt-4'>
            {[
              {
                label: title,
                value: formatRupiah(price, 'c aa'),
              },
              ...fees.map((fee) => ({
                label: fee.type,
                value: formatRupiah(fee.value, 'c aa'),
              })),
              {
                label: 'Total: ',
                value: formatRupiah(amount, 'c aa'),
              },
            ].map(({ label, value }, index) => (
              <div
                key={index}
                className='mt-1 flex flex-nowrap justify-between first:mt-0 last:mt-2.5 last:border-t last:py-2.5'
              >
                <p>{label}</p>
                <p>{value}</p>
              </div>
            ))}
          </div>
        </ListGroup>
        <ListGroup rootClasses='peer-[.list]:mt-5'>
          <div className='space-y-4 p-4'>
            {[
              { label: 'ID Pembayaran', value: invoiceId },
              {
                label: 'Metode Pembayaran',
                value: capitalize(paymentMethod.toLowerCase()),
              },
              {
                label: 'Waktu Pembayaran',
                value: DayJS(updated)
                  .format('D MMM YYYY, HH:mm _Z')
                  .replace('_', 'GMT'),
              },
              {
                label: 'Kadaluarsa',
                value: isPending
                  ? DayJS(expiryDate)
                      .format('D MMM YYYY, HH:mm _Z')
                      .replace('_', 'GMT')
                  : '',
              },
              { label: 'Email', value: customer?.email ?? '' },
            ]
              .filter((item) => !!item.value)
              .map(({ label, value }, key) => (
                <div key={key}>
                  <p className='text-sm tracking-normal text-zinc-500'>
                    {label}
                  </p>
                  <p className='mt-0.5'>{value}</p>
                </div>
              ))}
          </div>
        </ListGroup>
        <InvitationEditorPayment
          dismissable
          pid={externalId}
          url={invoiceUrl}
          root={{ open: payNow, onOpenChange: setPayNow }}
          onFailureCallback={() => onOpenChange(false)}
          onSuccessCallback={() => {
            onOpenChange(false)

            Toast.success(
              `Pembayaran berhasil! Undangan Anda berhasil diupgrade ke Paket ${tier}! 🎉🎉`
            )
          }}
        >
          {isPending && (
            <Button
              disabled={locked}
              className='absolute right-3 top-4 mx-auto table text-center text-primary'
            >
              Bayar
            </Button>
          )}
        </InvitationEditorPayment>
        {!isPending ? (
          <ListGroup>
            <ListItem className='text-primary' aria-disabled>
              Unduh bukti pembayaran
            </ListItem>
          </ListGroup>
        ) : (
          <>
            <ListGroup>
              <ListItem
                aria-disabled={locked}
                className='text-center text-red-500'
                onClick={removePurchaseAction}
              >
                Batalkan transaksi
              </ListItem>
            </ListGroup>
          </>
        )}
      </Presentation>
    </ListGroup>
  )
}

export default InvitationTransactionDetail
