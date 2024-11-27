import type { InvitationDetail } from '@/feat/invitation/schema'
import { Plus } from 'lucide-react'
import { tw } from '@/lib'
import { prisma } from '@/core/db'
import { getCheckUser } from '@/feat/auth/action'
import { Config, Routes } from '@/core/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ButtonIcon from '@/components/button/icon'
import EmptyState from '@/components/empty/state'
import CollectionList from '@/feat/invitation/pages/dasboard/collection/list'
import DayJS from '@/lib/dayjs'

const CollectionAddNew = dynamic(
  () => import('@/feat/invitation/pages/dasboard/collection/add'),
  {
    ssr: false,
  }
)

export default async function InvitationPageCollection() {
  const { email } = await getCheckUser()

  const myInvitation = await prisma.invitation.findMany({
    where: { email },
  })

  const isPending = myInvitation.some((inv) => inv.onHold || inv.pending)
  const invitations = myInvitation as InvitationDetail[]
  const displayList = invitations
    .filter((inv) => !inv.onHold)
    .map(({ id, pid, type, slug, tier, expiredAt, updatedAt, galleries }) => ({
      id,
      pid,
      type,
      tier,
      slug,
      expiredAt,
      updatedAt,
      metaImage:
        galleries.find(
          (gallery) => gallery.role === Config.GalleryType.InvitationMeta
        )?.url ?? '',
    }))

  const list = displayList.filter(
    (item) => !DayJS().tz().isAfter(DayJS(item.expiredAt).tz(), 'date')
  )

  const expiredList = displayList.filter((item) =>
    DayJS().tz().isAfter(DayJS(item.expiredAt).tz(), 'date')
  )

  return (
    <div className='flex h-full flex-col'>
      <div className='absolute -top-[30px] right-12 h-6 text-center lg:-top-[86px] lg:right-0'>
        <CollectionAddNew asChild>
          <ButtonIcon
            aria-label='Buat undangan baru'
            className='size-6 bg-black text-white transition-opacity will-change-opacity hover:opacity-70'
          >
            <Plus size={20} />
          </ButtonIcon>
        </CollectionAddNew>
      </div>
      {isPending && (
        <div className='z-1 my-4 grid gap-safe lg:grid-cols-2'>
          <div className='flex rounded-field bg-white px-4 py-3'>
            <div className='mr-3 mt-1 size-6 rounded-md'>
              <span className='inline-flex size-6 items-center justify-center rounded-full bg-yellow-400 font-semibold text-black'>
                !
              </span>
            </div>
            <div className='w-0 flex-grow'>
              <p className='font-semibold'>Transaksi berlangsung</p>
              <p className='mt-0.5 text-sm tracking-normal'>
                Anda memiliki satu transaksi yang masih berlangsung.{'\n'}
                <Link
                  className='inline-block text-primary'
                  href={Routes.invitationTransaction}
                >
                  Periksa
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
      {!displayList.length ? (
        <EmptyState
          className={tw('!-bottom-8', isPending && '*:-mb-24')}
          title='Belum ada undangan'
          description={'Undangan yang sudah Anda buat akan\ntampil disini.'}
        />
      ) : (
        <div className='space-y-8'>
          <CollectionList
            title='Recent'
            list={list
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .slice(0, 2)}
          />
          <CollectionList title='Lainnya' list={list.slice(2)} />
          <CollectionList title='Selesai' list={expiredList} />
        </div>
      )}
    </div>
  )
}
