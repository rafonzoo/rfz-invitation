'use client'

import type { UploadCallback } from '@/core/schema'
import type { InvitationGallery } from '@/feat/invitation/schema'
import type Sortable from 'sortablejs'
import { useEffect, useRef, useState } from 'react'
import { CirclePlus, Loader, Minus } from 'lucide-react'
import { serialize, tw } from '@/lib'
import { API, Config } from '@/core/config'
import { useLibrary, useMedia } from '@/hooks/common'
import Input from '@/components/input'
import ButtonIcon from '@/components/button/icon'
import Button from '@/components/button'
import Toast from '@/lib/toast'

async function uploadFetch(payload: unknown) {
  const storage = await fetch(API.Uploads, {
    method: 'POST',
    body: serialize(payload),
  })

  const json = (await storage.json()) as {
    data: { fileId: string; url: string }
    error: null | { message: string }
  }

  return json
}

async function removeFetch(payload: {
  fileId: string
  bucket: string
  folder: string
}) {
  const storage = await fetch(API.Uploads, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })

  const json = (await storage.json()) as {
    data: { fileId: string }
    error: null | { message: string }
  }

  return json
}

type FileFormat = (typeof SUPPORTED_FORMAT)[number]
const SUPPORTED_FORMAT = [
  'audio/mp3',
  'audio/mpeg',
  'video/*',
  'image/*',
  'image/png',
  'image/jpg',
  'image/jpeg',
] as const

type UploaderItemProps = InvitationGallery & {
  defaultValue?: string
}

type UploaderProps = {
  items: (UploaderItemProps | undefined)[]
  bucket: string
  folder: string
  format: FileFormat[]
  className?: string
  rootClasses?: string
  wrapperClasses?: string
  placeholderClasses?: string
  maxSize?: number
  maxFile?: number
  withReplace?: boolean
  onUploadComplete?: (arg: UploadCallback) => void | Promise<void>
  onDeleteClick?: (arg: { removedFileId: string }) => void | Promise<void>
  children?: RFZ<InvitationGallery & { parentIndex: number }>
}

/**
 * @deprecated in favour of ButtonUpload
 */
const Uploader: RFZ<UploaderProps> = ({
  items,
  bucket,
  folder,
  format,
  className,
  rootClasses,
  wrapperClasses,
  placeholderClasses,
  maxSize,
  maxFile = 1,
  withReplace = true,
  onUploadComplete,
  onDeleteClick,
  // Custom component for children
  children: Component,
}) => {
  const { sortablejs } = useLibrary()
  const [isUploading, setIsUploading] = useState<string | null>('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const isLoading = isUploading !== ''
  const sortableCurrent = useRef<Sortable | null>(null)
  const media = useMedia()
  const accept = format.join(',')
  const current = [...items, null].slice(0, maxFile)
  const canSort = items.length > 1

  useEffect(() => {
    const wrapper = wrapperRef.current

    if (!canSort || !wrapper || isUploading) {
      return
    }

    const initSortable = async () => {
      const Sortable = await sortablejs()

      try {
        // Make sure it doesn't broke hydration
        sortableCurrent.current?.destroy()
      } catch {}

      sortableCurrent.current = new Sortable(wrapper, {
        animation: 300,
        delay: 300,
        draggable: '.media-item',
        forceFallback: true,
        chosenClass: 'selected',
        onChoose: () => wrapper.classList.add('on-drag'),
        onUnchoose: () => wrapper.classList.remove('on-drag'),
      })
    }

    initSortable()
    return () => sortableCurrent.current?.destroy()
  }, [canSort, isUploading, sortablejs])

  function upload(index: number, fileId?: string) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0]
      const removedFileId = fileId
      const maxedOut = maxSize || Config.MaxUploadSizeMB

      if (!file || e.defaultPrevented) {
        return (e.target.value = '')
      }

      if (file.size > maxedOut * 1000 * 1000) {
        e.target.value = ''

        return Toast.error(
          [
            `Ukuran file terlalu tinggi: ${Math.round((file.size / 1000 / 1000) * maxedOut) / maxedOut} MB`,
            `Maksimum ${maxedOut} MB`,
          ].join('. ')
        )
      }

      setIsUploading(fileId ?? null)

      try {
        let uploads = await media.upload(file)
        let keepUpload = true

        // If theres an ID of the image in the gallery, remove it.
        // In case removing is failure, abort the upload
        if (removedFileId) {
          const { error } = await removeFetch({
            fileId: removedFileId,
            bucket,
            folder,
          })

          keepUpload = error ? false : keepUpload
        }

        if (!keepUpload) {
          throw new Error('Terjadi kesalahan saat menggunggah file.')
        }

        const { data, error } = await uploadFetch({
          ...uploads,
          bucket,
          folder,
        })

        if (!data || error) {
          throw new Error('Terjadi kesalahan saat menggunggah file.')
        }

        await Promise.resolve(
          onUploadComplete?.({ ...data, index, removedFileId })
        )
      } catch (e) {
        Toast.error((e as Error).message)
      }

      e.target.value = ''
      setIsUploading(e.target.value)
    }
  }

  async function remove(fileId: string) {
    // prettier-ignore
    if (!window.confirm('File akan dihapus dan tidak dapat dikembalikan. Lanjutkan?')) {
      return
    }

    setIsUploading(fileId)

    try {
      const { data, error } = await removeFetch({ bucket, folder, fileId })
      if (!data || error) {
        throw new Error('Terjadi kesalahan saat menghapus file.')
      }
      await onDeleteClick?.({ removedFileId: data.fileId })
    } catch (e) {
      Toast.error((e as Error).message)
    }

    setIsUploading('')
  }

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    const item = e.currentTarget.parentElement
    const input = item?.previousElementSibling

    if (!item || !(input instanceof HTMLInputElement)) {
      return
    }

    input.click()
  }

  return (
    <div
      ref={wrapperRef}
      className={tw(
        'group/media space-x-3 overflow-x-auto overflow-y-hidden whitespace-nowrap leading-[0]',
        canSort && '[.on-drag&]:cursor-grabbing',
        rootClasses
      )}
    >
      {current.map((item, index) => (
        <div
          // key={`${index}` + (item?.fileId ?? index)} // Used for test
          key={item?.fileId ?? index}
          className={tw(
            item && 'media-item', // Selector. DO NOT REMOVE!
            item && canSort && !isUploading && 'group-[:not(.on-drag)]/media:cursor-grab', // prettier-ignore
            'group/media-item relative my-3 inline-block w-full text-base transition-opacity duration-300 will-change-opacity',
            'group-[.on-drag]/media:[&.selected]:z-1 group-[.on-drag]/media:[&:not(.selected)]:opacity-40',
            wrapperClasses
          )}
        >
          <Input
            type='file'
            accept={accept}
            disabled={isLoading}
            tabIndex={-1}
            className='sr-only w-px min-w-0'
            onChange={upload(index, item?.fileId)}
            onMouseMove={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
          />
          {item ? (
            <>
              <div className={tw('relative overflow-hidden', className)}>
                {Component && <Component {...item} parentIndex={index} />}
                {!isLoading && withReplace && (
                  <Button
                    type='button'
                    onClick={onClick}
                    className='absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-center text-xs group-[.on-drag]/media:hidden'
                  >
                    Ubah
                  </Button>
                )}
              </div>

              {/* Different parent with media/group-item */}
              {!isLoading && (
                <ButtonIcon
                  aria-label='Hapus media'
                  className='absolute -right-2 -top-2 bg-red-500 text-white hover:bg-red-700 group-[.on-drag]/media:hidden'
                  onClick={() => remove(item.fileId)}
                >
                  <Minus size={20} />
                </ButtonIcon>
              )}
            </>
          ) : (
            <div
              className={tw(
                'relative cursor-auto border-2 border-dashed border-zinc-300',
                className,
                placeholderClasses
              )}
            >
              {!isLoading && (
                <ButtonIcon
                  aria-label='Tambah media'
                  onClick={onClick}
                  className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-[.on-drag]/media:pointer-events-none'
                >
                  <CirclePlus className='text-zinc-400' />
                </ButtonIcon>
              )}
            </div>
          )}
          {(!!item ? isUploading === item.fileId : isUploading === null) && (
            <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <Loader className='animate-spin text-zinc-400' />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default Uploader
