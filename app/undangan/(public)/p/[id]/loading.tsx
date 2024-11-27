import type { Viewport } from 'next'
import { Loader } from 'lucide-react'

export const viewport: Viewport = {
  themeColor: 'black',
}

export default async function Loading() {
  return (
    <div className='absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-black text-white/70'>
      <Loader className='mt-4 animate-spin' />
      <p className='mt-3 w-full text-center text-sm tracking-normal'>
        Loading...
      </p>
    </div>
  )
}
