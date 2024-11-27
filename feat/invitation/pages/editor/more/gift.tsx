'use client'

import { useState } from 'react'
import { serialize } from 'object-to-formdata'
import { sanitizeInput } from '@/helpers/client'
import { formEntries } from '@/core/utils'
import { updateGift } from '@/feat/invitation/action'
import Presentation from '@/components/presentation'
import ListGroup from '@/components/list/group'
import Textarea from '@/components/textarea'
import Button from '@/components/button'
import Toast from '@/lib/toast'

type InvitationEditorMoreGiftProps = {
  id: string
  gift: string
}

const InvitationEditorMoreGift: RF<InvitationEditorMoreGiftProps> = ({
  id,
  gift,
  children,
}) => {
  const [open, onOpenChange] = useState(false)
  const [lock, setLocked] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const entries = formEntries<true>(form)
      .gift.trim()
      .split('\n')
      .filter((name) => !!name && name.length >= 3)
      .map((guest) => guest.replace(/\s/g, ' ').trim())

    if (entries.join(' ') === gift.replace(/\r\n/g, ' ')) {
      return onOpenChange(false)
    }

    setLocked(true)
    const { errorMessage } = await updateGift(
      serialize({ id, gift: entries.join('\n') })
    )

    setLocked(false)
    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  return (
    <Presentation
      root={{ open, onOpenChange }}
      locked={lock}
      title={{ children: 'Info virtual' }}
      trigger={{ asChild: true, children }}
    >
      <form onSubmit={onSubmit}>
        <ListGroup info='Informasi penerima seperti nama dan nomor bank jika ada. Dipisahkan oleh baris baru (Enter).'>
          <Textarea
            placeholder={'(OVO) John Doe: 000000000\n(Shopee) John: 0000000000'}
            className='min-h-40'
            defaultValue={gift}
            name='gift'
            {...sanitizeInput({ pattern: '\n:' })}
          />
        </ListGroup>
        <Button className='absolute right-3 top-4 text-primary'>Save</Button>
      </form>
    </Presentation>
  )
}

export default InvitationEditorMoreGift
