'use client'

import type {
  InvitationGallery,
  InvitationGuests,
  InvitationMeta,
} from '@/feat/invitation/schema'
import { PencilLine, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { InvitationTierEnum } from '@/feat/invitation/config'
import { getInvitationGuest } from '@/feat/invitation/helpers'
import { keys } from '@/core/utils'
import Presentation from '@/components/presentation'
import ButtonIcon from '@/components/button/icon'
import ListInput from '@/components/input/list'
import ListGroup from '@/components/list/group'
import ListItem from '@/components/list/item'
import EmptyState from '@/components/empty/state'
import Safearea from '@/components/layout/safearea'
import InvitationEditorMeta from '@/feat/invitation/pages/editor/meta'
import InvitationEditorGuestState from '@/feat/invitation/pages/editor/guest/state'
import InvitationEditorGuestBulk from '@/feat/invitation/pages/editor/guest/bulk'

type InvitationEditorGuestProps = {
  id: string
  tier: InvitationTierEnum
  guests: InvitationGuests
  meta: InvitationMeta
  metaImage?: InvitationGallery
}

const MIN_SHOW_SEARCH = 5

const MAX_GUEST_HARDLIMIT = 1_000

const InvitationEditorGuest: RF<InvitationEditorGuestProps> = ({
  tier,
  guests,
  children,
  id: invitationId,
  ...meta
}) => {
  const [current, setCurrent] = useState(guests)
  const [query, setQuery] = useState('')
  const belowHardLimit = current.length < MAX_GUEST_HARDLIMIT
  const candAddGuest = current.length < getInvitationGuest(tier)
  const withoutSearch = current.length < MIN_SHOW_SEARCH
  const showGuestState = candAddGuest && belowHardLimit
  const queriedGuests = current
    .sort((g1, g2) => g1.name.localeCompare(g2.name))
    .filter((guest) =>
      query ? guest.name.startsWith(query) || guest.name.includes(query) : true
    )

  const roles = Object.groupBy(queriedGuests, (item) => item.role)
  const sortedRoles = keys(roles).sort((role1, role2) =>
    role2.localeCompare(role1)
  )

  function onUpdate() {
    if (guests.length < MIN_SHOW_SEARCH) {
      setQuery('')
    }

    setCurrent(guests)
  }

  return (
    <Presentation
      title={{ children: 'Bagikan' }}
      wrapperClasses={withoutSearch ? '' : 'before:my-0'}
      trigger={{ asChild: true, children }}
      content={{
        onOpenAutoFocus: (e) => e.preventDefault(),
        onCloseAutoFocus: () => setQuery(''),
      }}
      beforeContent={
        withoutSearch ? (
          void 0
        ) : (
          <Safearea className='mb-4'>
            <ListInput
              type='search'
              placeholder='Cari tamu'
              className='rounded-field'
              onChange={(e) => setQuery(e.target.value)}
            />
          </Safearea>
        )
      }
    >
      {showGuestState && !query && (
        <ListGroup className='divide-none' rootClasses='z-1'>
          <InvitationEditorGuestState {...{ onUpdate }}>
            <ListItem prefix={<UserPlus className='text-primary' size={20} />}>
              Buat tamu baru
            </ListItem>
          </InvitationEditorGuestState>
          <InvitationEditorGuestBulk
            id={invitationId}
            previous={guests}
            onSuccessCallback={onUpdate}
          />
        </ListGroup>
      )}
      {!!current.length ? (
        !queriedGuests.length ? (
          <p className='rounded-field bg-white px-4 py-2 text-center text-zinc-500'>
            Tidak ditemukan
          </p>
        ) : (
          sortedRoles.map((role) => (
            <ListGroup
              key={role}
              title={!role ? 'Daftar tamu' : role.toUpperCase()}
            >
              {roles[role]?.map(({ id, name, role }) => (
                <div key={name} className='relative'>
                  <InvitationEditorMeta
                    {...{ name, ...meta }}
                    guestId={id}
                    id={invitationId}
                  >
                    <ListItem title={name} className='pr-10' />
                  </InvitationEditorMeta>
                  <InvitationEditorGuestState
                    key={name}
                    {...{ name, role, onUpdate }}
                    id={guests.find((guest) => guest.id === id)?.id}
                  >
                    <ButtonIcon
                      aria-label='Edit tamu'
                      className='absolute right-3 top-1/2 inline-flex size-7 -translate-y-1/2 items-center text-primary'
                    >
                      <PencilLine size={16} />
                    </ButtonIcon>
                  </InvitationEditorGuestState>
                </div>
              ))}
            </ListGroup>
          ))
        )
      ) : (
        <EmptyState
          className='top-14'
          title='Belum ada tamu'
          description={'Buat tamu pertama Anda dan mulai\n bagikan undangan!'}
        />
      )}
    </Presentation>
  )
}

export default InvitationEditorGuest
