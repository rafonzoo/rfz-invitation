'use client'

import type { InvitationEvents, InvitationKeys } from '@/feat/invitation/schema'
import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { tw } from '@/lib'
import { requiredStringType } from '@/core/schema'
import { updateKeyEvents } from '@/feat/invitation/action'
import { formEntries } from '@/core/utils'
import ListGroup from '@/components/list/group'
import ListInput from '@/components/input/list'
import Presentation from '@/components/presentation'
import ButtonIcon from '@/components/button/icon'
import Button from '@/components/button'
import InvitationEventSection from '@/feat/invitation/components/events'
import InvitationKeySection from '@/feat/invitation/components/keys'
import KeyEventSheetItem from '@/feat/invitation/pages/editor/key-event/event'
import DayJS from '@/lib/dayjs'
import Toast from '@/lib/toast'

type KeyEventProps = {
  id: string
  keys: InvitationKeys
  events: InvitationEvents
}

const MAX_KEYS = 7

const MAX_EVENTS = 3

const InvitationEditorKeyEvent: RFZ<KeyEventProps> = (props) => {
  const [open, onOpenChange] = useState(false)
  const [locked, setLocked] = useState(false)
  const [keys, setKeys] = useState(props.keys)
  const [events, setEvents] = useState(props.events)

  function addNewKey() {
    setKeys((prev) => {
      let id = 1 // All ID start in 1 not a zero 0

      while (prev.some((p) => p.id === id)) {
        id++ // Partially increase
      }

      const result = [
        ...prev,
        {
          id,
          text: '',
        },
      ]

      return result
    })
  }

  function addNewEvent() {
    setEvents((prev) => {
      let id = 1 // All ID start in 1 not a zero 0

      while (prev.some((p) => p.id === id)) {
        id++ // Partially increase
      }

      const result = [
        ...prev,
        {
          name: '',
          date: DayJS().tz().format('D MMMM YYYY'),
          mapUrl: '',
          address: '',
          id,
        },
      ]

      return result
    })
  }

  function removeEvent(eventId: number) {
    setEvents((prev) => prev.filter(({ id }) => id !== eventId))
  }

  function safeToClose(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest('form')
    if (!form) return true

    let isKeyRequireSave = false
    let isEventRequireSave = false

    const data = new FormData(form)
    const entries = formEntries(data)

    isKeyRequireSave =
      props.keys.length !== keys.length ||
      !Object.keys(entries)
        .filter((entry) => entry.includes('description'))
        .every(
          (entry, index) => entries[entry] === (props.keys[index]?.text || '')
        )

    isEventRequireSave =
      props.events.length !== events.length ||
      !events.every((event, index) =>
        Object.keys(event).every((key) => {
          if (key === 'id') return true // Will skip dayjs validity

          const entryKey = `event-${index + 1}-${key}`
          const entryValue =
            key === 'date'
              ? DayJS(entries[entryKey]).tz().format('D MMMM YYYY')
              : entries[entryKey]

          // @ts-expect-error
          return entryValue === props.events[index]?.[key]
        })
      )

    return !isKeyRequireSave && !isEventRequireSave
  }

  async function updateSheet(form: FormData) {
    setLocked(true)

    const { errorMessage } = await updateKeyEvents(form)
    setLocked(false)

    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  return (
    <>
      <InvitationKeySection enableAnimation={false} keys={props.keys}>
        <div className='absolute left-0 w-full translate-y-12'>
          <div className='relative mx-auto size-10'>
            <span className='pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-80'></span>
            <Presentation
              {...{ locked }}
              root={{ open, onOpenChange }}
              content={{
                onOpenAutoFocus: (e) => e.preventDefault(),
                onCloseAutoFocus: () => {
                  setKeys(props.keys)
                  setEvents(props.events)
                },
              }}
              title={{ children: 'Poin dan Acara' }}
              trigger={{
                'aria-label': 'Edit profile',
                title: 'Setelan profil',
                className: tw(
                  'relative z-1 inline-flex size-10 items-center justify-center rounded-full bg-primary text-white'
                ),
              }}
            >
              <form action={updateSheet}>
                <ListGroup title='Poin'>
                  {keys.map((key, index) => (
                    <div key={key.id} className='flex items-center'>
                      {index > 1 && (
                        <div className='remove-description peer ml-4 mr-1 flex'>
                          <ButtonIcon
                            aria-label='Hapus deskripsi'
                            className='size-5 bg-red-500 text-white hover:bg-red-700'
                            onClick={() => {
                              setKeys((prev) =>
                                prev.filter((item) => item.id !== key.id)
                              )
                            }}
                          >
                            <Minus size={16} />
                          </ButtonIcon>
                        </div>
                      )}
                      <ListInput
                        defaultValue={key.text}
                        name={`description-${key.id}`}
                        placeholder='Tulis deskripsi'
                        schema={requiredStringType(3, 60)}
                        rootClasses='flex-grow w-0'
                        className={
                          tw(
                            index > 1 && '[.remove-description_~_div_>_&]:pl-2'
                          ) || void 0
                        }
                      />
                    </div>
                  ))}
                </ListGroup>
                <div className='mb-6 mt-4 text-center'>
                  {keys.length < MAX_KEYS && (
                    <ButtonIcon
                      onClick={addNewKey}
                      aria-label='Tambah deskripsi'
                      className='size-7 bg-black text-white transition-opacity hover:opacity-70'
                    >
                      <Plus size={20} />
                    </ButtonIcon>
                  )}
                </div>
                {events.map((event, index) => (
                  <KeyEventSheetItem
                    key={event.id}
                    defaultValue={event}
                    title={!index ? 'Acara' : void 0}
                    onDelete={!index ? void 0 : removeEvent}
                  />
                ))}
                <div className='mt-4 text-center'>
                  {events.length < MAX_EVENTS && (
                    <ButtonIcon
                      onClick={addNewEvent}
                      aria-label='Tambah acara'
                      className='size-7 bg-black text-white transition-opacity hover:opacity-70'
                    >
                      <Plus size={20} />
                    </ButtonIcon>
                  )}
                </div>
                <input type='hidden' name='id' value={props.id} />
                <Button
                  className='absolute right-3 top-4 text-primary'
                  onClick={(e) => {
                    if (!safeToClose(e)) {
                      return
                    }

                    onOpenChange(false)
                    e.preventDefault()
                  }}
                >
                  Save
                </Button>
              </form>
            </Presentation>
          </div>
        </div>
      </InvitationKeySection>
      <InvitationEventSection enableAnimation={false} events={props.events} />
    </>
  )
}

export default InvitationEditorKeyEvent
