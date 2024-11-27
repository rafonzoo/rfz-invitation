import type {
  InvitationGallery,
  InvitationMeta,
} from '@/feat/invitation/schema'
import type { UploadCallback } from '@/core/schema'
import { serialize } from 'object-to-formdata'
import { useState } from 'react'
import { Bucket, Config } from '@/core/config'
import { requiredStringType } from '@/core/schema'
import { formEntries, keys, lf } from '@/core/utils'
import { updateGalleries, updateMeta } from '@/feat/invitation/action'
import { sanitizeInput } from '@/helpers/client'
import Button from '@/components/button'
import Editable from '@/components/editable'
import ListInput from '@/components/input/list'
import ListGroup from '@/components/list/group'
import ListItem from '@/components/list/item'
import Presentation from '@/components/presentation'
import ButtonUpload from '@/components/upload/button'
import Toast from '@/lib/toast'

type InvitationEditorMetaTemplateProps = {
  id: string
  title?: string
  meta: InvitationMeta
  metaImage?: InvitationGallery
}

const InvitationEditorMetaTemplate: RF<InvitationEditorMetaTemplateProps> = ({
  id,
  title,
  meta,
  metaImage,
  children,
}) => {
  const [open, onOpenChange] = useState(false)
  const [locked, setLocked] = useState(false)

  function safeToClose(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest('form')
    if (!form) return true

    const entries = formEntries(new FormData(form))

    return keys(entries)
      .filter((entry) => entry !== 'id')
      .every(
        (entry) =>
          lf(entries[entry] as string) === lf(meta[entry as keyof typeof meta])
      )
  }

  async function updatePreview(form: FormData) {
    setLocked(true)

    const { errorMessage } = await updateMeta(form)
    setLocked(false)

    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  async function updateGallery(payload: Partial<UploadCallback>) {
    const { errorMessage } = await updateGalleries(
      serialize({
        id,
        role: Config.GalleryType.InvitationMeta,
        ...payload,
      })
    )

    if (errorMessage) {
      return Toast.error(errorMessage)
    }
  }

  return (
    <Presentation
      {...{ locked }}
      root={{ open, onOpenChange }}
      content={{ onOpenAutoFocus: (e) => e.preventDefault() }}
      title={{ children: title ?? 'Edit preview' }}
      wrapperClasses='before:my-0'
      trigger={{
        asChild: true,
        children: children ?? (
          <Button className='absolute right-3 top-4 text-primary'>Edit</Button>
        ),
      }}
    >
      <form action={updatePreview}>
        <div className='relative mb-6'>
          <div
            className='mx-auto size-28 overflow-hidden rounded-full border bg-cover bg-center bg-no-repeat'
            style={
              metaImage?.url
                ? { backgroundImage: `url(${metaImage.url})` }
                : void 0
            }
          />
          <ButtonUpload
            bucket={Bucket.Invitation}
            folder={id}
            defaultValue={metaImage?.fileId}
            format={['image/png', 'image/jpg', 'image/jpeg']}
            onComplete={updateGallery}
            removeClasses='absolute top-0 left-1/2 translate-x-[calc(-50%_+_50px)]'
            wrapperClasses='flex justify-center mt-3'
          />
        </div>
        <ListGroup>
          <ListInput
            name='title'
            defaultValue={meta.title}
            placeholder='Judul'
            schema={requiredStringType(3, 60)}
            {...sanitizeInput()}
          />
          <ListInput
            name='description'
            defaultValue={meta.description}
            placeholder='Deskripsi'
            schema={requiredStringType(3, 120)}
            {...sanitizeInput()}
          />
        </ListGroup>
        <ListGroup
          info='Mendukung beberapa format teks untuk mempersonalisasi tulisan Anda.'
          className='divide-none'
        >
          <Editable
            name='templateMessage'
            className='min-h-[212px] px-4 py-2.5'
          >
            {lf(meta.templateMessage)}
          </Editable>
        </ListGroup>
        <ListGroup>
          <Presentation
            title={{ children: 'Daftar format' }}
            trigger={{
              asChild: true,
              children: <ListItem title='Daftar format' withChevron />,
            }}
          >
            <ListGroup info='Simbol dan karakter diatas otomatis berubah saat disalin.'>
              <div className='relative overflow-x-auto'>
                <table className='w-full divide-y text-left'>
                  <thead className='text-gray-70'>
                    <tr>
                      <th scope='col' className='px-4 py-2 font-semibold'>
                        Sebelum
                      </th>
                      <th scope='col' className='px-4 py-2 font-semibold'>
                        Sesudah
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    <tr>
                      <td className='px-4 py-2'>::url::</td>
                      <td className='px-4 py-2'>Tautan undangan</td>
                    </tr>
                    <tr>
                      <td className='px-4 py-2'>::name::</td>
                      <td className='px-4 py-2'>Nama tamu</td>
                    </tr>
                    <tr>
                      <td className='px-4 py-2'>::title::</td>
                      <td className='px-4 py-2'>Judul preview</td>
                    </tr>
                    <tr>
                      <td className='px-4 py-2'>::description::</td>
                      <td className='px-4 py-2'>Deskripsi preview</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ListGroup>
            <ListGroup info='Simbol ikut disalin di platform-platform tertentu namun hilang dalam penyalinan teks biasa.'>
              <div className='relative overflow-x-auto'>
                <table className='w-full divide-y text-left'>
                  <thead className='text-gray-70'>
                    <tr>
                      <th scope='col' className='px-4 py-2 font-semibold'>
                        Sebelum
                      </th>
                      <th scope='col' className='px-4 py-2 font-semibold'>
                        Sesudah
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    <tr>
                      <td className='px-4 py-2'>*Bold*</td>
                      <td className='px-4 py-2 font-semibold'>Bold</td>
                    </tr>
                    <tr>
                      <td className='px-4 py-2'>_Italic_</td>
                      <td className='px-4 py-2 italic'>Italic</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ListGroup>
          </Presentation>
          <input type='hidden' name='id' value={id} />
        </ListGroup>
        <Button
          className='absolute right-3 top-4 text-primary'
          onClick={(e) => {
            if (!safeToClose(e)) {
              return
            }

            e.preventDefault()
            onOpenChange(false)
          }}
        >
          Save
        </Button>
      </form>
    </Presentation>
  )
}

export default InvitationEditorMetaTemplate
