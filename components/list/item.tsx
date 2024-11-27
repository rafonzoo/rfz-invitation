'use client'

import { ChevronRight } from 'lucide-react'
import { tw } from '@/lib'
import Tapview from '@/components/tapview'

type ListItemProps = Omit<TAG<'div'>, 'prefix' | 'role' | 'children'> & {
  title?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  withChevron?: boolean
}

const ListItem: RF<ListItemProps> = ({
  title,
  prefix,
  suffix,
  withChevron,
  children,
  ...props
}) => {
  const disabled = props['aria-disabled']
  const Tag = children ? 'div' : 'p'

  return (
    <Tapview
      {...props}
      className={tw(
        'flex min-h-10 flex-nowrap items-center outline-none',
        '!border-none', // No border from parent
        props.className
      )}
    >
      {prefix && (
        <div className='ml-4 mr-3 flex min-h-6 min-w-6 items-center justify-center *:pointer-events-none group-aria-disabled/tapview:pointer-events-none'>
          {prefix}
        </div>
      )}
      <div
        className={tw(
          'relative flex min-h-[inherit] w-0 flex-grow flex-nowrap items-center border-t first:pl-4 group-first/tapview:border-t-0',
          withChevron ? 'pr-7' : 'pr-3'
        )}
      >
        <Tag className='mr-2.5 w-0 flex-grow truncate group-aria-disabled/tapview:pointer-events-none group-aria-readonly/tapview:pointer-events-none'>
          {children ?? title ?? ''}
        </Tag>
        <div
          inert={!!disabled}
          className='inline-flex min-h-[inherit] flex-nowrap items-center justify-end'
        >
          {/* Suffix here */}
          {suffix}

          {/* Only with chevron enabled */}
          {withChevron && (
            <ChevronRight
              size={20}
              className='absolute right-2 text-zinc-400'
            />
          )}
        </div>
      </div>
    </Tapview>
  )
}

export default ListItem
