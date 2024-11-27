'use client'

import type { DialogProps } from '@/components/dialog'
import { useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { createNewOne } from '@/feat/invitation/action'
import { invitationCreateNewPayload } from '@/feat/invitation/schema'
import { sanitizeInput } from '@/helpers/client'
import {
  InvitationTierEnum,
  InvitationTypeEnum,
} from '@/feat/invitation/config'
import { delay, keys, objectTrim } from '@/core/utils'
import {
  capitalUnstrip,
  getInvitationPrice,
  isPaidVersion,
} from '@/feat/invitation/helpers'
import { formatRupiah } from '@/core/helpers'
import { Routes } from '@/core/config'
import Link from 'next/link'
import Button from '@/components/button'
import Presentation from '@/components/presentation'
import Select from '@/components/select'
import ListGroup from '@/components/list/group'
import ListInput from '@/components/input/list'
import InvitationEditorUpgrade from '@/feat/invitation/pages/editor/upgrade'
import Toast from '@/lib/toast'

const CollectionAddNew: RF<DialogProps['trigger']> = (trigger) => {
  const [open, onOpenChange] = useState(false)
  const [tier, setTier] = useState<InvitationTierEnum | ''>('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [locked, setLocked] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  async function createInvitation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLocked(true)
    const { errorMessage } = await createNewOne(new FormData(e.currentTarget))

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
      title={{ children: 'Undangan baru' }}
      trigger={trigger}
      content={{
        onCloseAutoFocus: () => {
          setTier('')
          setName('')
          setType('')
        },
      }}
    >
      <form
        ref={formRef}
        className='flex h-full flex-col'
        onSubmit={createInvitation}
      >
        <ListGroup>
          <div className='flex flex-nowrap items-center pl-4'>
            <label htmlFor='name' className='w-16'>
              Nama
            </label>
            <ListInput
              type='text'
              id='name'
              name='name'
              placeholder='Alice dan Jasper'
              schema={invitationCreateNewPayload.entries.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onClear={() => setName('')}
              {...sanitizeInput()}
            />
          </div>
          <div className='flex flex-nowrap items-center pl-4'>
            <label htmlFor='type' className='w-16'>
              Perihal
            </label>
            <Select
              id='type'
              name='type'
              value={type}
              onChange={(e) => setType(e.target.value)}
              schema={invitationCreateNewPayload.entries.type}
            >
              <option value='' disabled>
                -Pilih salah satu-
              </option>
              {keys(InvitationTypeEnum).map((type) => (
                <option key={type} value={type}>
                  {capitalUnstrip(type)}
                </option>
              ))}
            </Select>
          </div>
        </ListGroup>
        <ListGroup
          info={
            <>
              Informasi detil tiap paket dapat dilihat melalui{' '}
              <Link
                href={Routes.invitationPricing}
                className='whitespace-nowrap text-primary opacity-50'
                target='_blank'
                onClick={(e) => e.preventDefault()}
              >
                halaman paket
                <ArrowUpRight size={14} strokeWidth={1.5} className='inline' />
              </Link>
            </>
          }
        >
          <div className='flex flex-nowrap items-center pl-4'>
            <label htmlFor='tier' className='w-16'>
              Paket
            </label>
            <Select
              id='tier'
              name='tier'
              schema={invitationCreateNewPayload.entries.tier}
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
            >
              {keys(InvitationTierEnum).map((tier, index) => (
                <option key={index} value={InvitationTierEnum[tier]}>
                  {[tier, formatRupiah(getInvitationPrice(tier), '(att)')].join(
                    ' '
                  )}
                </option>
              ))}
            </Select>
          </div>
        </ListGroup>
        {!isPaidVersion(tier as any) && (
          <Button className='absolute right-3 top-4 text-primary'>Buat</Button>
        )}
      </form>
      {tier && isPaidVersion(tier) && (
        <InvitationEditorUpgrade
          {...objectTrim({ name, type, tier })}
          disableAutoChoose
          onSuccessCallback={() => delay(280).then(() => onOpenChange(false))}
        >
          <Button
            className='absolute right-3 top-4 text-primary'
            onClick={(e) => {
              formRef.current?.reportValidity()

              if (!formRef.current?.checkValidity()) {
                e.preventDefault()
              }
            }}
          >
            Buat
          </Button>
        </InvitationEditorUpgrade>
      )}
    </Presentation>
  )
}

export default CollectionAddNew
