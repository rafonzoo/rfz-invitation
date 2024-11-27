import { CircleCheck, CircleX } from 'lucide-react'
import { tw } from '@/lib'
import { formatRupiah } from '@/core/helpers'
import { keys } from '@/core/utils'
import { InvitationConfig, InvitationTierEnum } from '@/feat/invitation/config'
import { Config } from '@/core/config'

export default async function InvitationPricing() {
  const tiering = keys(InvitationConfig).map((tier) => ({
    name: tier,
    price: InvitationConfig[tier].Price,
    maxGuest: InvitationConfig[tier].MaxGuest,
    expiredAt: InvitationConfig[tier].ExpireAt,
    maxPhoto: InvitationConfig[tier].MaxPhoto,
    maxUploadSize: InvitationConfig[tier].UploadMaxSize,
    uploadMusic: InvitationConfig[tier].UploadMusic,
    headline: !InvitationConfig[tier].Price
      ? 'Untuk undangan cepat dalam waktu dekat. Always free.'
      : tier === InvitationTierEnum.Premium
        ? 'Undangan elegan tanpa buat budget makin tipis.'
        : 'Undangan dengan persiapan yang lebih jauh.',
  }))

  return (
    <div className='mx-auto mt-6 max-w-245'>
      <ul className='relative flex w-full flex-nowrap overflow-x-auto overflow-y-hidden px-safe'>
        {tiering.map(
          (
            {
              headline,
              name,
              price,
              maxGuest,
              expiredAt,
              maxUploadSize,
              maxPhoto,
              uploadMusic,
            },
            index
          ) => (
            <li
              key={index}
              className='ml-4 min-h-118 w-full min-w-70 rounded-field bg-zinc-100 p-safe pb-16 first:ml-0'
            >
              <h3 className='text-lead-title-sm font-semibold'>{name}</h3>
              <p className='mt-4'>
                <span className='text-large-title font-semibold tracking-tight'>
                  {formatRupiah(price, 'a')}
                </span>
                <span className='ml-0.5 inline-block text-large-title-sm text-zinc-500'>
                  {formatRupiah(price, 'tt')}
                </span>
              </p>
              <p className='mt-4'>{headline}</p>
              <ul className='mt-6 space-y-4 border-t pt-6'>
                {[
                  {
                    icon: true,
                    text: !price ? '3 undangan aktif' : 'Tidak terbatas',
                  },
                  {
                    icon: true,
                    text: `${maxGuest < 0 ? 'Tidak terbatas' : maxGuest + ' tamu'}`,
                  },
                  {
                    icon: true,
                    text: `${!expiredAt ? `Aktif 7 hari` : expiredAt < 0 ? 'Unlimited lifetime' : `Aktif ${expiredAt} bulan`}`,
                  },
                  {
                    icon: true,
                    text: `Foto${maxUploadSize > Config.MusicUploadSizeMB ? '/video' : ''} landing`,
                  },
                  {
                    icon: !!price,
                    text: !maxPhoto
                      ? 'Foto gallery'
                      : maxPhoto + ' foto gallery',
                  },
                  {
                    icon: uploadMusic,
                    text: 'Musik/audio',
                  },
                ].map(({ icon, text }, key) => (
                  <li key={key} className={tw(!icon && 'opacity-30') || void 0}>
                    <p className='flex'>
                      {!!icon ? (
                        <CircleCheck
                          className='mr-1.5 fill-black text-zinc-100'
                          strokeWidth={1.5}
                        />
                      ) : (
                        <CircleX
                          className='mr-1.5 fill-black text-zinc-100'
                          strokeWidth={1.5}
                        />
                      )}
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
