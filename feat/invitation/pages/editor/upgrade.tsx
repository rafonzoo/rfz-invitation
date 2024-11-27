'use client'

import { ArrowUpRight, ChevronDown, Lock } from 'lucide-react'
import { useId, useState } from 'react'
import { serialize } from '@/lib'
import { delay, keys } from '@/core/utils'
import {
  capitalUnstrip,
  formattedSlug,
  getInvitationPrice,
} from '@/feat/invitation/helpers'
import { InvitationConfig, InvitationTierEnum } from '@/feat/invitation/config'
import { formatRupiah } from '@/core/helpers'
import { createOrUpgrade } from '@/feat/invitation/action'
import { Config, Routes } from '@/core/config'
import Link from 'next/link'
import Button from '@/components/button'
import ListGroup from '@/components/list/group'
import Presentation from '@/components/presentation'
import Select from '@/components/select'
import LazyImage from '@/feat/invitation/components/image/lazy'
import InvitationEditorPayment from '@/feat/invitation/pages/editor/payment'
import DayJS from '@/lib/dayjs'
import Toast from '@/lib/toast'

type UpgradeProps = {
  id?: string
  name?: string
  type?: string
  tier?: InvitationTierEnum
  disableAutoChoose?: boolean
  onSuccessCallback?: () => void
  onCancelCallback?: () => void
}

const InvitationEditorUpgrade: RF<UpgradeProps> = ({
  id = '',
  name = '',
  type = '',
  tier: initial = InvitationTierEnum.Starter,
  disableAutoChoose,
  children,
  onSuccessCallback,
  onCancelCallback,
}) => {
  const [open, onOpenChange] = useState(false)
  const [tier, setTier] = useState(initial)
  const [data, setData] = useState({ pid: '', url: '' })
  const triggerId = useId()
  const canChoose = !disableAutoChoose
  const expireAt = InvitationConfig[tier].ExpireAt
  const maxGuest = InvitationConfig[tier].MaxGuest
  const tieringArray = keys(InvitationTierEnum).filter(
    (_, index, keys) => index > keys.indexOf(initial)
  )

  function closeDialog() {
    document.getElementById(triggerId)?.click()
    onSuccessCallback?.()
  }

  function onOpenAutoFocus(e: Event) {
    const [firstTier] = tieringArray
    e.preventDefault()

    if (canChoose && !!firstTier) {
      return setTier(InvitationTierEnum[firstTier])
    }

    setTier(initial)
  }

  async function createInvoiceAction() {
    await delay(1000)

    const { data, errorMessage } = await createOrUpgrade(
      serialize({ name, type, tier, id })
    )

    if (!data || errorMessage) {
      onOpenChange(false)
      return Toast.error(errorMessage)
    }

    setData(data)
  }

  return (
    <Presentation
      close={{ id: triggerId }}
      wrapperClasses='before:my-0'
      content={{ onOpenAutoFocus }}
      title={{
        asChild: true,
        children:
          canChoose && tieringArray.length > 1 ? (
            <div className='relative'>
              <Select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className='peer/select-tier absolute bottom-0 left-0 right-0 top-0 pr-5 font-normal opacity-0'
              >
                {tieringArray.map((packageName) => (
                  <option
                    key={packageName}
                    value={packageName}
                    className='text-center'
                  >
                    {packageName}
                  </option>
                ))}
              </Select>
              <p className='pointer-events-none inline-flex h-10 select-none items-center justify-center rounded-field py-2 pl-3 pr-5 peer-focus-visible/select-tier:ring'>
                {tier}
                <ChevronDown size={16} className='absolute right-1 mt-0.5' />
              </p>
            </div>
          ) : (
            <h2>{tier}</h2>
          ),
      }}
      trigger={
        canChoose && !tieringArray.length
          ? void 0
          : {
              asChild: !!children && typeof children !== 'string',
              children,
            }
      }
    >
      <ListGroup className='divide-none p-4'>
        <div className='mx-auto w-full max-w-[327px]'>
          <div className='h-28'></div>
          <p className='mb-4 text-center text-sm tracking-normal text-zinc-500'>
            <>
              Upload lagu + {InvitationConfig[tier].MaxPhoto} foto, aktif{' '}
              {InvitationConfig[tier].ExpireAt} bulan
              <br />
              dan {maxGuest < 0 ? 'bebas' : maxGuest} tamu.{' '}
            </>
            <Link
              href={Routes.invitationPricing}
              className='inline-flex items-center text-primary opacity-50'
              target='_blank'
              onClick={(e) => e.preventDefault()}
            >
              More
              <ArrowUpRight size={14} strokeWidth={1.5} className='mt-0.5' />
            </Link>
          </p>
          <InvitationEditorPayment
            pid={data.pid}
            url={data.url}
            root={{ open, onOpenChange }}
            onCancelCallback={() => {
              document.getElementById(triggerId)?.click()
              onCancelCallback?.()
            }}
            content={{
              onOpenAutoFocus: createInvoiceAction,
              onCloseAutoFocus: () => setData({ pid: '', url: '' }),
            }}
            onSuccessCallback={() => {
              closeDialog()

              Toast.success(
                `Pembayaran berhasil! Undangan Anda berhasil diupgrade ke Paket ${tier}! 🎉🎉`
              )
            }}
          >
            <Button
              className='inline-flex h-11 w-full items-center justify-center rounded-field bg-black font-semibold text-white'
              onClick={(e) => {
                // prettier-ignore
                if (window.confirm(`Upgrade "${formattedSlug(name)}" ke Paket ${tier}?\n\nNomor transaksi/invoice akan dibuat dan popup pembayaran akan terbuka.`)) {
                  return
                }

                e.preventDefault()
              }}
            >
              Bayar {formatRupiah(getInvitationPrice(tier), 'att')}
            </Button>
          </InvitationEditorPayment>
        </div>
      </ListGroup>
      <ListGroup
        title={capitalUnstrip(type)}
        info={
          <>
            <span>
              Harga belum termasuk biaya layanan{' '}
              {formatRupiah(Config.FeeFixed, 'c aa')}
            </span>
          </>
        }
      >
        <div className='flex space-x-4 px-4 py-2.5'>
          <div className='flex size-10 items-center justify-center overflow-hidden'>
            <LazyImage
              src='/assets/img/placeholder-icon.png'
              alt='Placeholder'
              enable={false}
            />
          </div>
          <div className='w-0 flex-grow'>
            <p>{formattedSlug(name)}</p>
            <p className='text-xs tracking-base text-zinc-500'>
              Aktif sampai{' '}
              {DayJS()
                .tz()
                .add(expireAt < 0 ? 12 : expireAt, 'month')
                .format('D MMMM YYYY')}
            </p>
          </div>
        </div>
      </ListGroup>
      <p className='mt-6 flex justify-center space-x-2 text-xxs tracking-base text-zinc-500'>
        <Lock size={11} className='mt-px' />
        <span className='block w-0 flex-grow'>
          Data-data termasuk pembayaran tidak kami bagikan ke pihak manapun.{' '}
          {/* @TODO: Uncomment if the page is ready */}
          {/* <span className='text-black'>Selengkapnya</span> */}
        </span>
      </p>
    </Presentation>
  )
}

export default InvitationEditorUpgrade
