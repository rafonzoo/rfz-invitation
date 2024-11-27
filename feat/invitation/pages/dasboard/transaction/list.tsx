'use client'

import type { Purchase } from '@prisma/client'
import type { Invoice } from 'xendit-node/invoice/models'
import { useState } from 'react'
import { keys } from '@/core/utils'
import Input from '@/components/input'
import EmptyState from '@/components/empty/state'
import InvitationTransactionDetail from '@/feat/invitation/pages/dasboard/transaction/detail'
import DayJS from '@/lib/dayjs'

type InvitationTransactionListProps = {
  purchases: Purchase[]
}

const InvitationTransactionList: RF<InvitationTransactionListProps> = ({
  purchases: fromServer,
}) => {
  const [purchases, setPurchases] = useState(fromServer)
  const [query, setQuery] = useState('')
  const pendingItem = purchases.filter((item) => item.status === 'PENDING')
  const filtered = [
    ...pendingItem,
    ...purchases
      .filter((item) => item.status !== 'PENDING')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter((purchase) =>
        (purchase.detail as unknown as Invoice).items?.some(
          (item) =>
            item.category?.split(':')[1].startsWith(query.trim()) ||
            item.category?.split(':')[1].includes(query.trim())
        )
      ),
  ]

  const groupedItem = Object.groupBy(filtered, (item) =>
    [
      item.createdAt.getFullYear(),
      item.createdAt.getMonth(),
      new Date().getDate(),
    ].join('-')
  )

  return (
    <div className='flex h-full w-full flex-col md:mt-0'>
      {!!purchases.length && (
        <div className='sticky top-0 z-1 bg-zinc-100 py-4 md:px-0'>
          <p className='text-sm tracking-normal'>
            Ditampilkan: <span className='font-semibold'>1 tahun terakhir</span>
          </p>
          <Input
            type='search'
            className='mt-1.5 h-10 rounded-field bg-zinc-200/50 pl-3 pr-9 last:pr-3'
            placeholder='Cari harga atau nama'
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {!!purchases.length ? (
        !filtered.length ? (
          <p className='rounded-field bg-white px-4 py-2 text-center text-zinc-500 first:mt-6'>
            Tidak ditemukan
          </p>
        ) : (
          keys(groupedItem).map((date) => (
            <div
              key={date}
              className='peer/group-date mt-4 peer-[]/group-date:mt-8'
            >
              <p className='text-xs uppercase tracking-base text-zinc-500'>
                {DayJS(date).get('month') === new Date().getMonth() - 1
                  ? 'Bulan ini'
                  : DayJS(date).add(1, 'month').fromNow()}
              </p>
              <div className='grid-col-1 mt-1.5 grid gap-safe lg:grid-cols-2 lg:first:mt-0'>
                {groupedItem[date as any]?.map(({ id: pid, ...purchase }) => (
                  <InvitationTransactionDetail
                    key={pid}
                    onPurchaseChange={() => setPurchases(fromServer)}
                    {...{ pid }}
                    {...(purchase.detail as unknown as Invoice)}
                  />
                ))}
              </div>
            </div>
          ))
        )
      ) : (
        <EmptyState
          className='!-bottom-8'
          title='Belum ada transaksi'
          description={
            'Transaksi yang pernah Anda lakukan\nakan tampil disini.'
          }
        />
      )}
    </div>
  )
}

export default InvitationTransactionList
