'use client'

import type { InvitationGuests } from '@/feat/invitation/schema'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { serialize } from 'object-to-formdata'
import { sanitizeInput } from '@/helpers/client'
import { addBulkGuest } from '@/feat/invitation/action'
import ListItem from '@/components/list/item'
import Presentation from '@/components/presentation'
import ListGroup from '@/components/list/group'
import Textarea from '@/components/textarea'
import Button from '@/components/button'
import Toast from '@/lib/toast'

type InvitationEditorGuestBulkProps = {
  id: string
  previous: InvitationGuests
  onSuccessCallback?: () => void
}

const InvitationEditorGuestBulk: RFZ<InvitationEditorGuestBulkProps> = ({
  id: invitationId = '',
  previous,
  onSuccessCallback,
}) => {
  const [open, onOpenChange] = useState(false)
  const [current, setCurrent] = useState('')

  function abort(e: Event) {
    if (!current) {
      return
    }

    e.preventDefault()
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!current) {
      return onOpenChange(false)
    }

    const entries = current
      .trim()
      .split('\n')
      .filter((name) => !!name && name.length >= 3)
      .map((guest) => guest.replace(/\s/g, ' ').trim())

    if (entries.every((entry) => previous.some(({ name }) => name === entry))) {
      return onOpenChange(false)
    }

    const { errorMessage } = await addBulkGuest(
      serialize({ invitationId, entries: JSON.stringify(entries) })
    )

    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  return (
    <Presentation
      root={{ open, onOpenChange }}
      title={{ children: 'Bulk tamu' }}
      content={{
        onEscapeKeyDown: abort,
        onPointerDownOutside: abort,
        onCloseAutoFocus: () => {
          onSuccessCallback?.()
          setCurrent('')
        },
      }}
      close={{
        onClick: (e) => {
          // prettier-ignore
          if (current && !window.confirm('Batalkan perubahan?\nTamu yang sudah Anda tulis akan hilang.')) {
            return e.preventDefault()
          }
        },
      }}
      trigger={{
        asChild: true,
        children: (
          <ListItem prefix={<Users className='text-primary' size={20} />}>
            Buat bulk tamu
          </ListItem>
        ),
      }}
    >
      <form onSubmit={onSubmit}>
        <ListGroup
          info={
            <>
              <span className='inline-block'>
                Menambah satu atau lebih tamu reguler dengan memasukkan nama
                tamu dan dipisahkan oleh baris baru (Enter).
              </span>

              <span className='mt-6 block'>
                Hanya nama tamu dengan jumlah karakter lebih dari 2, nama tamu
                belum ada, dan jumlah tamu tidak melebihi limit dari paket yang
                dipilih—yang akan ditambahkan ke daftar tamu.
              </span>
            </>
          }
        >
          <Textarea
            placeholder={'Emma\nJohn\nWindi'}
            className='min-h-40'
            defaultValue={current}
            name='entries'
            onChange={(e) => setCurrent(e.target.value)}
            {...sanitizeInput({ pattern: '\n' })}
          />
        </ListGroup>
        <Button
          className='absolute right-3 top-4 text-primary'
          onClick={(e) => {
            if (!current) {
              e.preventDefault()
              onOpenChange(false)
            }
          }}
        >
          Save
        </Button>
      </form>
    </Presentation>
  )
}

export default InvitationEditorGuestBulk
