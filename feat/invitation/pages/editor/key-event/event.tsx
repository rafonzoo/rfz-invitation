'use client'

import type { InvitationEvent } from '@/feat/invitation/schema'
import { invitationEventType } from '@/feat/invitation/schema'
import ListGroup from '@/components/list/group'
import ListInput from '@/components/input/list'
import Textarea from '@/components/textarea'
import Button from '@/components/button'
import DayJS from '@/lib/dayjs'

type KeyEventSheetItemProps = {
  defaultValue: InvitationEvent
  title?: string
  onDelete?: (id: number) => void
}

const KeyEventSheetItem: RFZ<KeyEventSheetItemProps> = ({
  title,
  defaultValue,
  onDelete,
}) => {
  const { name, date, mapUrl, address, id } = defaultValue
  const prefix = `event-${id}`

  return (
    <ListGroup
      title={title ?? 'Tambahan acara'}
      rootClasses='relative'
      afterTitle={
        onDelete && (
          <Button
            type='button'
            className='absolute right-0 top-0 text-sm tracking-normal text-red-500 hover:underline'
            onClick={() => onDelete?.(id)}
          >
            Hapus
          </Button>
        )
      }
    >
      <div className='flex flex-nowrap pl-4'>
        <label htmlFor={`${prefix}-name`} className='w-[70px] pt-2'>
          Nama{' '}
        </label>
        <ListInput
          id={`${prefix}-name`}
          name={`${prefix}-name`}
          placeholder='Alia John'
          defaultValue={name}
          schema={invitationEventType.entries.name}
        />
      </div>
      <div className='flex flex-nowrap pl-4'>
        <label htmlFor={`${prefix}-date`} className='w-[70px] pt-2'>
          Tanggal{' '}
        </label>
        <ListInput
          type='date'
          id={`${prefix}-date`}
          name={`${prefix}-date`}
          defaultValue={DayJS(date, 'D MMMM YYYY').tz().format('YYYY-MM-DD')}
          schema={invitationEventType.entries.date}
        />
      </div>
      <div className='flex flex-nowrap pl-4'>
        <label htmlFor={`${prefix}-mapUrl`} className='w-[70px] pt-2'>
          Maps{' '}
        </label>
        <ListInput
          id={`${prefix}-mapUrl`}
          name={`${prefix}-mapUrl`}
          placeholder='https://maps.google.com'
          defaultValue={mapUrl}
          schema={invitationEventType.entries.mapUrl}
        />
      </div>
      <div className='flex flex-nowrap pl-4'>
        <label htmlFor={`${prefix}-address`} className='w-[70px] pt-2'>
          Alamat{' '}
        </label>
        <Textarea
          id={`${prefix}-address`}
          name={`${prefix}-address`}
          placeholder='Tulis waktu dan alamat acara'
          className='min-h-[200px] md:min-h-[130px]'
          defaultValue={address}
          schema={invitationEventType.entries.address}
        />
      </div>
      <input type='hidden' name={`${prefix}-id`} defaultValue={id} />
    </ListGroup>
  )
}

export default KeyEventSheetItem
