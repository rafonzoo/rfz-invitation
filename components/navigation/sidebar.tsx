'use client'

import type { Session } from 'next-auth'
import { useSelectedLayoutSegment } from 'next/navigation'
import { tw } from '@/lib'
import { Routes } from '@/core/config'
import { getTitleFromRoute } from '@/helpers/client'
import { capitalize } from '@/core/utils'
import Link from 'next/link'

type SidebarProps = {
  session?: Session
  className?: string
}

type SidebarItemProps = TAG<'a'> & {
  isSelected?: boolean
  iconClasses?: string
  icon?: React.ReactNode
}

const SidebarItem: RF<SidebarItemProps> = ({
  children,
  className,
  isSelected,
  iconClasses,
  icon,
  ...props
}) => {
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!props.href) {
      e.preventDefault()
    }

    props.onClick?.(e)
  }
  return (
    <Link
      {...props}
      tabIndex={props.tabIndex ?? 0}
      href={props.href ?? '/#'}
      onClick={onClick}
      className={tw(
        'flex min-h-10 w-full items-center rounded-field px-3',
        'focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-amber-400',
        isSelected ? 'bg-primary text-white' : 'hover:text-primary hover:dark:text-blue-400 active:bg-zinc-200 active:dark:bg-zinc-800', // prettier-ignore
        className
      )}
    >
      <span
        className={tw(
          'mr-2.5 inline-flex items-center justify-center rounded',
          iconClasses
        )}
      >
        {icon}
      </span>
      <span className='inline-flex w-full items-center justify-between'>
        {children}
      </span>
    </Link>
  )
}

const Sidebar: RF<SidebarProps> = ({ children, className }) => {
  const segment = useSelectedLayoutSegment() ?? ''
  const items = [
    {
      path: Routes.invitationKoleksi,
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 33 32' width={20}>
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
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 33 32' width={22}>
          <path
            fill='currentColor'
            d='m28.542 28.864.92-.94-3.05-3.115v-4.685h-1.297v5.24l3.427 3.5ZM12.29 6.161h6.737V3.78c0-.309-.097-.563-.291-.76a.997.997 0 0 0-.744-.299h-4.666c-.302 0-.55.1-.744.298a1.042 1.042 0 0 0-.291.76v2.383Zm13.474 25.807c-1.876 0-3.468-.668-4.775-2.003-1.308-1.337-1.962-2.964-1.962-4.879 0-1.915.654-3.541 1.962-4.877 1.309-1.337 2.9-2.005 4.775-2.005 1.875 0 3.467.668 4.777 2.005 1.309 1.336 1.962 2.962 1.96 4.877-.002 1.915-.656 3.542-1.96 4.88-1.305 1.336-2.897 2.004-4.777 2.002ZM3.22 28.527c-.775 0-1.422-.265-1.942-.795S.498 26.54.5 25.747V8.942c0-.793.26-1.454.78-1.984s1.166-.796 1.94-.797h7.385V3.78c0-.792.26-1.453.78-1.984.52-.531 1.167-.796 1.942-.795h4.664c.774 0 1.422.265 1.941.795.52.53.78 1.191.779 1.984V6.16h7.385c.774 0 1.421.266 1.94.797.519.53.779 1.192.78 1.984v7.222a9.04 9.04 0 0 0-2.439-1.057c-.859-.229-1.73-.344-2.614-.344-2.802 0-5.187 1.005-7.154 3.015-1.968 2.01-2.951 4.445-2.951 7.308 0 .58.048 1.159.145 1.736.096.577.243 1.145.441 1.705H3.22Z'
          />
        </svg>
      ),
    },
  ]

  return (
    <aside
      className={tw(
        'sticky top-0 hidden h-[100svh] w-full md:block md:max-w-[295px]',
        className
      )}
    >
      <div className='h-full px-4'>
        {/* Header */}
        <div className='flex items-center px-2.5 pb-4 pt-6'>{children}</div>
        {/* Content */}
        <div>
          <div className='px-2.5'>
            <h2 className='text-large-title font-bold'>RFZ</h2>
          </div>
          <ul className='mt-2.5 flex w-full flex-col space-y-1.5'>
            {items.map(({ path, icon }, index) => (
              <li key={index}>
                <SidebarItem
                  href={path}
                  icon={icon}
                  isSelected={path.includes(segment)}
                  iconClasses={
                    path.includes(segment) ? 'text-white' : 'text-primary'
                  }
                >
                  {capitalize(getTitleFromRoute(path))}
                </SidebarItem>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
