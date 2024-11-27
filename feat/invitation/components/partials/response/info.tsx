'use client'

import { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
import { tw } from '@/lib'
import Button from '@/components/button'
import ButtonIcon from '@/components/button/icon'
import Toast from '@/lib/toast'

type ResponseInfoProps = {
  gift: string
}

const ResponseInfo: RFZ<ResponseInfoProps> = ({ gift }) => {
  const [open, setOpen] = useState(false)
  const gifts = gift.split('\r\n')

  useEffect(() => {
    if (!gift) {
      setOpen(false)
    }
  }, [gift])

  function encapsulate(text: string) {
    let result = ''

    if (!text.match(/^\d+$/)) {
      return text
    }

    for (let i = 0; i < text.length; i++) {
      if (i > 8) {
        continue
      }

      if (i < 4) {
        result += text[i]
        continue
      }

      result += '•'
    }

    return result
  }

  async function copyText(text: string) {
    const clipboard = navigator.clipboard

    try {
      await clipboard.writeText(text.trim())
    } catch (e) {
      Toast.error('Gagal menyalin teks...')
      console.log(e)
    }

    Toast.success('Teks disalin!')
  }

  return (
    <div
      id='response-gift'
      className='mb-4 flex flex-wrap justify-between rounded-xl bg-zinc-100 p-6 md:items-center md-max:flex-col'
    >
      <p className='font-semibold'>Informasi pengiriman virtual</p>
      <div className='flex h-12 items-end text-left md:h-9 md-max:order-2'>
        <Button
          disabled={!gift}
          className='rounded-full bg-white px-4 py-2 text-sm font-bold tracking-normal'
          onClick={() => !!gift && setOpen((prev) => !prev)}
        >
          {!gift ? 'Belum ada' : open ? 'Tutup' : 'Tampilkan'}
        </Button>
      </div>
      {open && (
        <div className='mt-6 w-full'>
          <ul className='space-y-2 border-t pt-6 md-max:mb-2'>
            {gifts.map((item, index) => (
              <li key={index} className='flex justify-between'>
                {item
                  .split(':')
                  .slice(0, 2)
                  .map((text, idx) => (
                    <span
                      key={idx}
                      className={tw(
                        'truncate',
                        !idx
                          ? 'w-0 min-w-[130px] flex-grow'
                          : 'flex items-center text-primary'
                      )}
                    >
                      {!idx ? (
                        text.trim()
                      ) : (
                        <ButtonIcon
                          className='ml-1 min-w-4 hover:underline focus-visible:underline focus-visible:!ring-0'
                          aria-label='Salin'
                          onClick={() => copyText(text.trim())}
                        >
                          <span className='truncate'>
                            {encapsulate(text.slice(0, 24).trim())}
                          </span>
                          <span className='ml-1 block'>
                            <Copy size={16} />
                          </span>
                        </ButtonIcon>
                      )}
                    </span>
                  ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ResponseInfo
