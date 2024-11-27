'use client'

import type {
  InvitationGallery,
  InvitationMeta,
} from '@/feat/invitation/schema'
import { useEffect, useRef, useState } from 'react'
import { crlf } from '@/core/utils'
import { markdownSource } from '@/core/helpers'
import { Routes } from '@/core/config'
import dynamic from 'next/dynamic'
import Presentation from '@/components/presentation'
import ListGroup from '@/components/list/group'
import Button from '@/components/button'
import LazyImage from '@/feat/invitation/components/image/lazy'
import InvitationEditorMetaTemplate from '@/feat/invitation/pages/editor/meta/template'
import Toast from '@/lib/toast'

const ReactMarkdown = dynamic(() => import('@/components/markdown/rmd'), {
  ssr: false,
  loading: () => (
    <div className='fixed left-0 right-0 top-auto z-1 h-12 bg-zinc-100'></div>
  ),
})

type InvitationEditorMetaProps = {
  name?: string
  id: string
  guestId: string
  meta: InvitationMeta
  metaImage?: InvitationGallery
}

const InvitationEditorMeta: RF<InvitationEditorMetaProps> = ({
  name,
  id,
  guestId,
  children,
  meta,
  metaImage,
}) => {
  const [url, setUrl] = useState('')
  const markdownRef = useRef<HTMLDivElement | null>(null)
  const template = `${meta.templateMessage}`
    .replace(/::name::/g, name?.trim() || '#nama_tamu') // prettier-ignore
    .replace(/::title::/g, meta.title)
    .replace(/::description::/g, meta.description)
    .replace(/::url::/g, url)

  useEffect(() => {
    setUrl(
      [
        window.location.origin,
        Routes.invitationPublic,
        `/${id}-${guestId}`,
      ].join('')
    )
  }, [guestId, id])

  async function copyText(text?: string | null, showToast = '') {
    const clipboard = navigator.clipboard

    if (!text || !clipboard) {
      return
    }

    try {
      await clipboard.writeText(text)
    } catch (e) {
      Toast.error('Gagal menyalin teks...')
      console.log(e)
    }

    showToast && Toast.success(showToast)
  }

  return (
    <Presentation
      title={{ children: 'Preview' }}
      content={{ onOpenAutoFocus: (e) => e.preventDefault() }}
      trigger={{
        asChild: true,
        children,
      }}
    >
      <InvitationEditorMetaTemplate {...{ id, meta, metaImage }} />
      <ListGroup info='Preview ini mungkin terlihat berbeda di beberapa platform.'>
        <div className='m-0.5 flex overflow-hidden rounded-field rounded-bl-md rounded-br-md bg-zinc-100'>
          <div className='relative size-[88px] bg-zinc-200'>
            {metaImage && (
              <LazyImage
                src={metaImage.url}
                className='absolute left-0 top-0 h-full w-full object-cover object-center'
              />
            )}
          </div>
          <div className='flex w-0 flex-grow flex-col px-2.5 py-1.5'>
            <div>
              <p className='truncate'>{meta.title || '--'}</p>
              <p className='my-0.5 line-clamp-2 whitespace-normal text-xs tracking-base text-zinc-600'>
                {meta.description}
              </p>
            </div>
            <p className='mt-auto truncate text-xs tracking-base'>{url}</p>
          </div>
        </div>
        <div ref={markdownRef} className='relative'>
          <ReactMarkdown
            className='overflow-auto whitespace-pre-wrap break-words px-4 pb-4 pt-2.5 md:max-h-[242px]'
            allowedElements={['em', 'p', 'strong']}
            skipHtml
          >
            {markdownSource(crlf(template))}
          </ReactMarkdown>
        </div>
      </ListGroup>
      <div className='h-[123px]'></div>
      <div className='absolute bottom-0 left-0 w-full rounded-bl-field rounded-br-field border-t bg-zinc-100/50 px-4 pb-6 pt-2.5 backdrop-blur translate-z-0 md:px-6'>
        <Button
          className='inline-flex h-12 w-full items-center justify-center rounded-xl bg-black text-center font-semibold text-white hover:text-white/75'
          onClick={() =>
            copyText(
              markdownSource(template, true),
              'Teks disalin dengan format'
            )
          }
        >
          Salin dengan format
        </Button>
        <div className='mt-4 text-center'>
          <Button
            className='underline'
            onClick={() =>
              copyText(markdownRef.current?.innerText, 'Teks berhasil disalin')
            }
          >
            Salin teks saja
          </Button>
        </div>
      </div>
    </Presentation>
  )
}

export default InvitationEditorMeta
