'use client'

import type { UploadCallback } from '@/core/schema'
import { useEffect, useRef, useState } from 'react'
import { Loader, Minus } from 'lucide-react'
import { serialize, tw } from '@/lib'
import { API, Config } from '@/core/config'
import { useMedia } from '@/hooks/common'
import Button from '@/components/button'
import Input from '@/components/input'
import ButtonIcon from '@/components/button/icon'
import Toast from '@/lib/toast'

type FileFormat =
  | 'audio/mp3'
  | 'audio/mpeg'
  | 'video/*'
  | 'image/*'
  | 'image/png'
  | 'image/jpg'
  | 'image/jpeg'

type ButtonUploadProps = Omit<TAG<'button'>, 'defaultValue'> & {
  bucket: string
  folder: string
  format: FileFormat[]
  wrapperClasses?: string
  removeClasses?: string
  defaultValue?: string
  maxSize?: number
  variant?: 'default' | 'blank'
  index?: number
  onComplete: (arg: Partial<UploadCallback>) => any
  onLoading?: (value: boolean) => void
}

const ButtonUpload: RFZ<ButtonUploadProps> = ({
  bucket,
  folder,
  format,
  wrapperClasses,
  removeClasses,
  defaultValue,
  children,
  onComplete,
  onLoading,
  maxSize = Config.MaxUploadSizeMB,
  variant = 'default',
  index = 0,
  ...props
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const media = useMedia()
  const onLoadingRef = useRef(onLoading)
  const variantClasses = {
    blank: 'block',
    default: tw(
      'block rounded-full text-sm tracking-normal bg-white py-1.5 font-semibold',
      isUploading ? 'px-1.5' : 'px-5'
    ),
  }

  useEffect(() => onLoadingRef.current?.(isUploading), [isUploading])

  async function uploadFetch<T extends object>(payload: T) {
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

  async function removeFetch<T extends object>(payload: T) {
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

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const removedFileId = defaultValue

    if (!file || e.defaultPrevented) {
      return (e.target.value = '')
    }

    if (file.size > maxSize * 1000 * 1000) {
      e.target.value = ''

      return Toast.error(
        [
          `Ukuran file terlalu tinggi: ${Math.round((file.size / 1000 / 1000) * maxSize) / maxSize} MB`,
          `Maksimum ${maxSize} MB`,
        ].join('. ')
      )
    }

    setIsUploading(true)

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

      await Promise.resolve(onComplete({ ...data, index, removedFileId }))
    } catch (e) {
      Toast.error((e as Error).message)
    }

    e.target.value = ''
    setIsUploading(false)
  }

  async function onRemove() {
    const fileId = defaultValue

    // prettier-ignore
    if (!fileId || !window.confirm('File akan dihapus dan tidak dapat dikembalikan. Lanjutkan?')) {
      return
    }

    setIsUploading(true)

    try {
      const { data, error } = await removeFetch({ bucket, folder, fileId })
      if (!data || error) {
        throw new Error('Terjadi kesalahan saat menghapus file.')
      }

      await onComplete({ removedFileId: data.fileId })
    } catch (e) {
      Toast.error((e as Error).message)
    }

    setIsUploading(false)
  }

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    props.onClick?.(e)

    if (e.defaultPrevented) {
      return
    }

    const input = e.currentTarget?.previousElementSibling
    if (!(input instanceof HTMLInputElement)) {
      return
    }

    input.click()
  }
  return (
    <div className={tw('before:table after:table', wrapperClasses)}>
      {defaultValue && !isUploading && (
        <ButtonIcon
          aria-label='Hapus media'
          onClick={onRemove}
          disabled={isUploading}
          className={tw(
            'h-5 bg-red-500 text-white !opacity-100 hover:bg-red-700',
            removeClasses
          )}
        >
          <Minus size={20} />
        </ButtonIcon>
      )}
      {children}
      <Input
        {...{ onChange }}
        accept={format.join(',')}
        type='file'
        className='sr-only w-px min-w-0'
        tabIndex={-1}
        onMouseMove={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />
      <Button
        type='button'
        {...props}
        {...{ onClick }}
        disabled={props.disabled || isUploading}
        className={tw('!opacity-100', variantClasses[variant], props.className)}
      >
        {isUploading ? (
          <Loader size={20} className='animate-spin text-zinc-400' />
        ) : defaultValue ? (
          'Ubah'
        ) : (
          'Upload'
        )}
      </Button>
    </div>
  )
}

export default ButtonUpload
