'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from 'lucide-react'
import { useParams } from 'next/navigation'
import { tw } from '@/lib'
import { submitComment } from '@/feat/invitation/action'
import dynamic from 'next/dynamic'
import Button from '@/components/button'
import Toast from '@/lib/toast'

const ResponseLoader = () => (
  <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
    <Loader size={28} className='animate-spin opacity-40' />
  </span>
)

const ResponseField = dynamic(
  () => import('@/feat/invitation/components/partials/response/field'),
  {
    ssr: false,
    loading: ResponseLoader,
  }
)

type CommentFormProps = {
  canComment: boolean
  isSpecialGuest?: boolean
  placeholder?: string
}

const ResponseForm: RFZ<CommentFormProps> = ({
  canComment,
  placeholder,
  isSpecialGuest,
}) => {
  const [showField, setShowField] = useState(false)
  const wrapperRef = useRef<HTMLFormElement | null>(null)
  const reference = useParams().id as string | undefined

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const target = e.currentTarget
    e.preventDefault()

    // prettier-ignore
    if (!canComment || !(window.confirm('Pesan ini tidak dapat dihapus atau diedit ketika sudah dikirim. Kirim pesan Anda?'))) {
      return
    }

    const formData = new FormData(target)
    const { errorMessage } = await submitComment(formData)

    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    target.reset()
  }

  useEffect(() => {
    const wrapper = wrapperRef.current

    if (!wrapper) return

    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setShowField(true)
          instance.disconnect()
        }
      })
    })

    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  return (
    <form
      ref={wrapperRef}
      id='response-form'
      className='flex w-full flex-col text-left'
      onSubmit={onSubmit}
    >
      <p
        className={tw(
          'pb-2.5 pt-12 text-left font-semibold [#response-gift_+_form_&]:hidden',
          !showField && 'invisible'
        )}
      >
        Berikan respon:
      </p>
      <div>
        <div
          className={tw(
            'relative',
            isSpecialGuest ? 'min-h-[510px]' : 'min-h-[436px]'
          )}
        >
          {showField ? (
            <ResponseField
              key={Number(canComment)}
              {...{ canComment, isSpecialGuest, placeholder }}
            />
          ) : (
            <ResponseLoader />
          )}
        </div>
        <div className={tw('mt-8', !showField && 'invisible')}>
          {/* <p className='text-xs tracking-base text-zinc-500'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt,
            ut. Facere quidem quam officiis ea veritatis, odio autem rem nulla
            amet perspiciatis saepe commodi illum vero ipsum. Debitis,{' '}
            <span className='text-primary'>omnis voluptates</span>
          </p> */}
          {reference && reference.split('-').length === 2 && (
            <input type='hidden' name='reference' value={reference} />
          )}
          <Button
            disabled={!canComment}
            className='mt-4 inline-flex h-14 w-full items-center justify-center rounded-lg bg-black font-semibold text-white'
          >
            Kirim
          </Button>
        </div>
      </div>
    </form>
  )
}

export default ResponseForm
