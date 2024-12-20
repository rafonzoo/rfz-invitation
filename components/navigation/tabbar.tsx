'use client'

import { useSelectedLayoutSegment } from 'next/navigation'
import { tw } from '@/lib'
import { Routes } from '@/core/config'
import { getTitleFromRoute } from '@/helpers/client'
import { capitalize } from '@/core/utils'
import Link from 'next/link'

const TabBar: RFZ = () => {
  const segment = useSelectedLayoutSegment() ?? ''
  const items = [
    {
      path: Routes.invitationKoleksi,
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 33 32'
          width={28}
          className='mt-auto'
        >
          <path
            fill='currentColor'
            d='M.5 26.538a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3v-14a3 3 0 0 0-3-3h-26a3 3 0 0 0-3 3v14Zm4-20a1 1 0 0 0 1 1h22a1 1 0 1 0 0-2h-22a1 1 0 0 0-1 1Zm4-4a1 1 0 0 0 1 1h14a1 1 0 1 0 0-2h-14a1 1 0 0 0-1 1Z'
          />
        </svg>
      ),
    },
    {
      path: Routes.invitationTransaction,
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 33 32'
          width={28}
          className='mt-auto'
        >
          <path
            fill='currentColor'
            d='m28.542 28.864.92-.94-3.05-3.115v-4.685h-1.297v5.24l3.427 3.5ZM12.29 6.161h6.737V3.78c0-.309-.097-.563-.291-.76a.997.997 0 0 0-.744-.299h-4.666c-.302 0-.55.1-.744.298a1.042 1.042 0 0 0-.291.76v2.383Zm13.474 25.807c-1.876 0-3.468-.668-4.775-2.003-1.308-1.337-1.962-2.964-1.962-4.879 0-1.915.654-3.541 1.962-4.877 1.309-1.337 2.9-2.005 4.775-2.005 1.875 0 3.467.668 4.777 2.005 1.309 1.336 1.962 2.962 1.96 4.877-.002 1.915-.656 3.542-1.96 4.88-1.305 1.336-2.897 2.004-4.777 2.002ZM3.22 28.527c-.775 0-1.422-.265-1.942-.795S.498 26.54.5 25.747V8.942c0-.793.26-1.454.78-1.984s1.166-.796 1.94-.797h7.385V3.78c0-.792.26-1.453.78-1.984.52-.531 1.167-.796 1.942-.795h4.664c.774 0 1.422.265 1.941.795.52.53.78 1.191.779 1.984V6.16h7.385c.774 0 1.421.266 1.94.797.519.53.779 1.192.78 1.984v7.222a9.04 9.04 0 0 0-2.439-1.057c-.859-.229-1.73-.344-2.614-.344-2.802 0-5.187 1.005-7.154 3.015-1.968 2.01-2.951 4.445-2.951 7.308 0 .58.048 1.159.145 1.736.096.577.243 1.145.441 1.705H3.22Z'
          />
        </svg>
      ),
    },
  ]

  return (
    <nav className='sticky bottom-0 left-0 z-1 -mt-[57px] flex w-full items-center border-t border-zinc-200 bg-white/70 text-zinc-500 backdrop-blur-md md:hidden dark:border-zinc-800 dark:bg-zinc-900/80'>
      {items.map(({ path, icon }, index) => (
        <Link
          key={index}
          href={path}
          className={tw(
            'flex h-14 w-full flex-col items-center justify-center py-1',
            path.includes(segment) && 'text-primary dark:text-blue-400' // prettier-ignore
          )}
        >
          <span className='relative mt-auto block'>{icon}</span>
          <span className='mt-auto block text-xxs font-medium tracking-base'>
            {capitalize(getTitleFromRoute(path))}
          </span>
        </Link>
      ))}
    </nav>
  )
}

export default TabBar
