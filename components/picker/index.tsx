'use client'

import type { PopupProps } from '@/components/popup'
import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { tw } from '@/lib'
import { setValidity } from '@/helpers/client'
import Popup from '@/components/popup'
import Wheel from '@/components/picker/wheel'
import DayJS from '@/lib/dayjs'

type PickerProps = PopupProps & {
  name: string
  type?: 'date' | 'datetime-local'
  defaultValue?: string
  formatOutput?: string
  onSchemaRequested?: (timezone: string) => any
}

const TIMEZONE = [
  { offset: '+07:00', name: 'Asia/Jakarta', alias: 'WIB' },
  { offset: '+08:00', name: 'Asia/Makassar', alias: 'WITA' },
  { offset: '+09:00', name: 'Asia/Jayapura', alias: 'WIT' },
] as const

const DATE_READABLE_FORMAT = 'dddd, D MMMM YYYY (Z)'

const PICKER_FORMAT_DATE = 'ddd D MMM YY'

const Picker: RF<PickerProps> = ({
  name,
  /**
   * ISO Format
   */
  defaultValue: _default,
  type = 'date',
  formatOutput = DATE_READABLE_FORMAT,
  children,
  onSchemaRequested,
  ...popupProps
}) => {
  // Uncontrolled only
  const { current: defaultValue } = useRef(_default)
  const { pending } = useFormStatus()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const schemaRef = useRef(onSchemaRequested)

  // Find the particular timezone by the offset or guess user timezone
  const timezone =
    TIMEZONE.find(({ offset }) => offset === defaultValue?.slice(-6))?.name ??
    DayJS.tz.guess()

  // Placeholder will show if default value is provided otherwise it will return null.
  const [withPlaceholder, setPlaceholder] = useState(false)
  const [djs, setDjs] = useState(DayJS(defaultValue).tz(timezone))

  // By default, dayjs#diff will truncate the result to zero decimal places.
  // If you want a floating point number, pass true as the third argument.
  const initialIndex = {
    date: djs.diff(DayJS().tz(timezone), 'day', true),
    zone: !timezone ? 0 : TIMEZONE.map(({ name }) => name).indexOf(timezone),
  }

  // Run once while defaultValue is provided
  useEffect(
    () => (defaultValue ? setPlaceholder(true) : void 0),
    [defaultValue]
  )

  // This effect should run when
  // - Placeholder is shown
  // - Date is updated
  // - Timezone is updated
  useEffect(
    () =>
      schemaRef.current
        ? setValidity(inputRef, schemaRef.current(timezone))
        : void 0,
    [withPlaceholder, djs, timezone]
  )

  function onOpenAutoFocus(e: Event) {
    popupProps.content?.onOpenAutoFocus?.(e)

    // Only execute if default value not detected
    if (!defaultValue) {
      setPlaceholder(true)
    }
  }

  return (
    <Popup
      {...popupProps}
      trigger={{
        ...popupProps.trigger,
        asChild: false,
        disabled: pending,
        className: tw('disabled:opacity-40', popupProps.trigger?.className),
        children: (
          <>
            {defaultValue || withPlaceholder
              ? djs.format(formatOutput)
              : children}
          </>
        ),
      }}
      triggerWrapperProps={{
        children: (
          <input
            type='text'
            ref={inputRef}
            tabIndex={-1}
            name={name}
            className='sr-only pointer-events-none left-1/2 top-0 -translate-x-1/2'
            defaultValue={
              defaultValue || withPlaceholder ? djs.format() : void 0
            }
          />
        ),
      }}
      content={{
        ...popupProps.content,
        side: 'top',
        sideOffset: popupProps.content?.sideOffset ?? 16,
        collisionPadding: popupProps.content?.collisionPadding ?? 16,
        className: tw('px-0 py-6 origin-bottom', popupProps.content?.className), // prettier-ignore
        onOpenAutoFocus: onOpenAutoFocus,
      }}
    >
      <div className='mx-auto w-[87.5vw] min-w-[270px] max-w-80'>
        <div className='flex justify-center'>
          <div className='size-[180px]'>
            <Wheel
              initIdx={initialIndex.date}
              loop
              length={24}
              width={140}
              perspective='left'
              onWheelStop={(val, { track }) =>
                !val
                  ? void 0
                  : setDjs((prev) =>
                      DayJS.call(prev)
                        .tz(
                          TIMEZONE.find(
                            ({ offset }) => offset === prev.format('Z')
                          )!.name
                        )
                        .subtract(-track.details.abs, 'day')
                    )
              }
              setValue={(_, abs) =>
                DayJS()
                  .tz(timezone)
                  .subtract(-abs, 'day')
                  .format(PICKER_FORMAT_DATE)
              }
            />
          </div>
          <div className={tw('h-[180px] w-[70px]')}>
            <Wheel
              initIdx={initialIndex.zone}
              loop
              length={24}
              width={50}
              perspective='left'
              itemClasses={tw('justify-start')}
              setValue={(rel) => TIMEZONE.map(({ alias }) => alias)[rel % 3]}
              onWheelStop={(val) =>
                !val
                  ? void 0
                  : setDjs((prev) =>
                      prev.tz(TIMEZONE.find((zone) => zone.alias === val)!.name)
                    )
              }
            />
          </div>
        </div>
      </div>
    </Popup>
  )
}

export default Picker
