'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { removeGuest, upsertGuest } from '@/feat/invitation/action'
import { invitationGuestType } from '@/feat/invitation/schema'
import { formEntries } from '@/core/utils'
import { sanitizeInput } from '@/helpers/client'
import Button from '@/components/button'
import ListInput from '@/components/input/list'
import ListGroup from '@/components/list/group'
import ListItem from '@/components/list/item'
import Select from '@/components/select'
import Presentation from '@/components/presentation'
import Toast from '@/lib/toast'

type InvitationEditorGuestStateProps = {
  id?: string
  name?: string
  role?: string
  onUpdate?: () => void
}

const InvitationEditorGuestState: RF<InvitationEditorGuestStateProps> = ({
  id = '',
  name = '',
  role = '',
  children,
  onUpdate,
}) => {
  const [open, onOpenChange] = useState(false)
  const [locked, setLocked] = useState(false)
  const params = (useParams().id as string | undefined)?.split('-')
  const isEdit = !!id
  const invitationId = params?.[0] ?? ''

  function safeToClose(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest('form')
    if (!form) return true

    const entries = formEntries(new FormData(form), true)
    const isValid = form.checkValidity()

    return isValid && entries.name === name && entries.role === role
  }

  async function upsertAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocked(true)

    const { errorMessage } = await upsertGuest(new FormData(e.currentTarget))

    setLocked(false)
    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  async function removeAction(form: FormData) {
    setLocked(true)

    const { errorMessage } = await removeGuest(form)
    setLocked(false)

    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  return (
    <Presentation
      {...{ locked }}
      root={{ open, onOpenChange }}
      title={{ children: isEdit ? 'Edit tamu' : 'Buat tamu' }}
      content={{
        onCloseAutoFocus: onUpdate,
        onOpenAutoFocus: (e) => isEdit && e.preventDefault(),
      }}
      trigger={{
        asChild: true,
        children,
      }}
    >
      <form onSubmit={upsertAction}>
        <ListGroup info='Tamu VIP mendapatkan satu kolom tambahan "Jumlah" pada bagian RSVP.'>
          <div className='flex flex-nowrap items-center pl-4'>
            <label htmlFor='name' className='w-14'>
              Nama{' '}
            </label>
            <ListInput
              id='name'
              name='name'
              placeholder='Reacher'
              schema={invitationGuestType.entries.name}
              defaultValue={name.trim()}
              {...sanitizeInput()}
            />
          </div>
          <div className='flex flex-nowrap items-center pl-4'>
            <label htmlFor='role' className='w-14'>
              Jenis{' '}
            </label>
            <Select
              id='role'
              name='role'
              className='w-full'
              defaultValue={role}
            >
              <option value=''>Tamu Reguler</option>
              <option value='vip'>VIP</option>
            </Select>
          </div>
        </ListGroup>
        <input type='hidden' name='id' value={id} />
        <input type='hidden' name='invitationId' value={invitationId} />
        <Button
          className='absolute right-3 top-4 text-primary'
          disabled={locked}
          onClick={(e) => {
            if (!safeToClose(e)) {
              return
            }

            onOpenChange(false)
            e.preventDefault()
          }}
        >
          {isEdit ? 'Save' : 'Buat'}
        </Button>
      </form>
      {isEdit && (
        <form className='mb-auto mt-8' action={removeAction}>
          <input type='hidden' name='id' value={id} />
          <input type='hidden' name='invitationId' value={invitationId} />
          <ListGroup>
            <ListItem
              title='Hapus tamu'
              className='text-red-500'
              aria-disabled={locked}
              onClick={(e) => {
                // prettier-ignore
                if (window.confirm(`Hapus "${name}" dari daftar tamu?\n\nJika sudah dibagikan, tamu Anda tidak lagi dapat mengakses undangan Anda.`)) {
                  e.currentTarget.closest('form')?.requestSubmit()
                }
              }}
            />
          </ListGroup>
        </form>
      )}
    </Presentation>
  )
}

export default InvitationEditorGuestState
