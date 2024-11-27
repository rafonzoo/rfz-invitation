import type { Metadata } from 'next'
import Safearea from '@/components/layout/safearea'

export const metadata: Metadata = {
  title: 'Undangan | RFZ App',
}

/**
 * @TODO
 * Create or call this page under /app/undangan/(public)/page.tsx
 */

export default async function InvitationPage() {
  return (
    <div>
      <Safearea className='mt-16'>
        <p className='mx-auto w-[250px] text-center text-[48px] font-bold leading-[1.08] tracking-tight md:w-[672px] md:text-huge-title-sm lg:w-[980px] lg:text-colossal-title-sm'>
          Unik. <br className='hidden md:block' /> Simpel. Moderen.
        </p>
        <p className='mx-auto mt-4 w-70 text-center text-lead-title font-medium md:w-93 md:leading-[1.4] lg:w-143 lg:text-[30px] lg:leading-[1.25]'>
          Buat dan sebar undangan dengan cepat tanpa lama mikirin tema.
        </p>
      </Safearea>
    </div>
  )
}
