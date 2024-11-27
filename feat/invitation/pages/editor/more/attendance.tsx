'use client'

import type {
  InvitationGuests,
  InvitationResponses,
} from '@/feat/invitation/schema'
import { CheckCheck } from 'lucide-react'
import { tw } from '@/lib'
import Presentation from '@/components/presentation'
import ChartHorizontalBar from '@/components/chart/horizontal-bar'
import ListGroup from '@/components/list/group'
import ListItem from '@/components/list/item'

type InvitationEditorAttendanceProps = {
  title: string
  guests: InvitationGuests
  responses: InvitationResponses
}

const InvitationEditorAttendance: RF<InvitationEditorAttendanceProps> = ({
  title,
  guests,
  responses,
  children,
}) => {
  const ok = responses.filter(({ attendance }) => attendance === 'ok')
  const no = responses.filter(({ attendance }) => attendance === 'no').length

  return (
    <Presentation
      title={{ children: title }}
      trigger={{ asChild: true, children }}
    >
      <ChartHorizontalBar
        units='tamu'
        title='Menyatakan Hadir'
        titlePrefix={<CheckCheck size={20} className='text-primary' />}
        description='Respon tamu yang menyatakan hadir dibandingkan dengan tidak hadir.'
        data={[
          { value: no, label: 'Tidak' },
          {
            value: ok.length,
            primary: true,
            label: 'Hadir',
            className: tw('!bg-primary/80  text-white'),
          },
        ]}
      />
      {!!responses.length ? (
        <ListGroup rootClasses='mt-8' title='Sudah merespon'>
          {responses
            .map((item) => ({
              ...item,
              name:
                guests.find((guest) => guest.id === item.referenceId)?.name ??
                '',
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) => b.attendance.localeCompare(a.attendance))
            .map(({ name, referenceId, length, attendance }) => (
              <ListItem
                key={referenceId}
                prefix={
                  <span
                    className={tw(
                      'inline-flex size-4 items-center justify-center rounded-full',
                      attendance === 'ok' && 'bg-green-500',
                      attendance === 'no' && 'bg-red-500'
                    )}
                  />
                }
                suffix={
                  !!length ? (
                    <span className='text-zinc-500'>{length} orang</span>
                  ) : (
                    void 0
                  )
                }
              >
                {name}
              </ListItem>
            ))}
        </ListGroup>
      ) : (
        <p className='mb-12 mt-20 text-center text-sm tracking-normal text-zinc-600'>
          Tamu yang sudah memberikan respon
          <br />
          akan tampil disini.
        </p>
      )}
    </Presentation>
  )
}

export default InvitationEditorAttendance
