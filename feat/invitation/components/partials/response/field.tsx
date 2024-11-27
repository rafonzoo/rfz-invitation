'use client'

import { invitationResponsePayloadType } from '@/feat/invitation/schema'
import dynamic from 'next/dynamic'

const FloatingInput = dynamic(() => import('@/components/input/floating'), {
  ssr: false,
})

const FloatingSelect = dynamic(() => import('@/components/select/floating'), {
  ssr: false,
})

const FloatingTextarea = dynamic(
  () => import('@/components/textarea/floating'),
  { ssr: false }
)

type ResponseFieldProps = {
  canComment: boolean
  isSpecialGuest?: boolean
  placeholder?: string
}

const ResponseField: RFZ<ResponseFieldProps> = ({
  canComment,
  isSpecialGuest,
  placeholder,
}) => {
  return (
    <div className='space-y-2.5'>
      <FloatingInput
        disabled={!canComment}
        type='text'
        name='alias'
        placeholder='Nama'
        autoComplete='off'
        autoCorrect='off'
        schema={invitationResponsePayloadType.entries.alias}
      />
      <FloatingSelect
        disabled={!canComment}
        name='attendance'
        placeholder='Kehadiran'
        defaultValue=''
        schema={invitationResponsePayloadType.entries.attendance}
      >
        <option value='' disabled>
          -Pilih salah satu-
        </option>
        <option value='ok'>Hadir</option>
        <option value='no'>Tidak hadir</option>
      </FloatingSelect>
      {isSpecialGuest && (
        <FloatingSelect
          disabled={!canComment}
          name='length'
          placeholder='Jumlah'
          defaultValue='1'
          schema={invitationResponsePayloadType.entries.length}
        >
          <option value='1'>1 orang</option>
          <option value='2'>2 orang</option>
        </FloatingSelect>
      )}
      <FloatingTextarea
        disabled={!canComment}
        name='comment'
        placeholder={placeholder ?? 'Komentar'}
        autoComplete='off'
        autoCorrect='off'
        schema={invitationResponsePayloadType.entries.comment}
      />
    </div>
  )
}

export default ResponseField
