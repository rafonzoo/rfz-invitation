'use client'

import type { User } from 'next-auth'
import { useState } from 'react'
import {
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from 'next/navigation'
import { tw } from '@/lib'
import { capitalize } from '@/core/utils'
import ButtonIcon from '@/components/button/icon'
import Presentation from '@/components/presentation'
import ButtonAuth from '@/components/button/auth'
import Safearea from '@/components/layout/safearea'
import ListItem from '@/components/list/item'
import ListGroup from '@/components/list/group'
import LazyImage from '@/feat/invitation/components/image/lazy'

type MainProps = {
  user: User
  before?: React.ReactNode
  className?: string
}

const Main: RF<MainProps> = ({ user, children, before, className }) => {
  const [bgImage, setBgImage] = useState(false)
  const segment = useSelectedLayoutSegment() ?? ''
  const segments = useSelectedLayoutSegments()
  const singleSegment = segments.length === 1

  return (
    <Safearea
      as='main'
      className={tw(
        'flex h-full min-h-[inherit] flex-grow flex-col border-zinc-300 md-max:*:mx-auto md-max:*:max-w-118',
        'md:mx-0 md:rounded-none md:border-l md:px-safe',
        className
      )}
    >
      {before}
      <nav className='mb-2.5 mt-4 flex min-h-6 w-full items-center space-x-1.5 md:mb-4 md:mt-6'>
        {/* @TODO */}
      </nav>

      <div className='grid h-full w-full flex-grow grid-rows-[auto,1fr] md:mx-auto md:max-w-245'>
        {singleSegment && (
          <header className='flex justify-between lg:mb-6'>
            <div className='text-large-title font-bold lg:hidden'>
              {capitalize(segment)}
            </div>
            <div className='flex items-center lg:w-full'>
              <Presentation
                title={{ children: 'Akun' }}
                trigger={{
                  asChild: true,
                  children: (
                    <ButtonIcon aria-label='Akun Anda'>
                      {user.image && !bgImage ? (
                        <LazyImage
                          src={user.image}
                          alt={user.name ?? 'Foto Anda'}
                          referrerPolicy='no-referrer'
                          onError={() => setBgImage(true)}
                          onLoad={() => setBgImage(false)}
                          className='block size-9 rounded-full lg:size-[100px]'
                        />
                      ) : (
                        <span
                          className={tw(
                            'block size-9 rounded-full lg:size-[100px]',
                            bgImage && 'bg-zinc-200'
                          )}
                        />
                      )}
                    </ButtonIcon>
                  ),
                }}
              >
                <ListGroup>
                  <ListItem aria-controls='auth-logout'>
                    <ButtonAuth
                      id='auth-logout'
                      tabIndex={-1}
                      className='pointer-events-none text-red-500'
                      onClick={(e) => {
                        e.stopPropagation()

                        // prettier-ignore
                        if (window.confirm('Keluar dari akun?')) {
                            return
                          }

                        e.preventDefault()
                      }}
                    >
                      Keluar
                    </ButtonAuth>
                  </ListItem>
                </ListGroup>
              </Presentation>
              <div className='hidden md:ml-4 lg:block'>
                <div className='text-2xl font-bold -tracking-lead xxl:text-large-title-sm'>
                  {user.name}
                </div>
                <div className='text-sm tracking-base text-zinc-600'>
                  {user.email}
                </div>
              </div>
            </div>
          </header>
        )}
        {/* Content */}
        <div className='relative min-h-80 before:table after:table'>
          {children}
        </div>

        {/* Tabbar Gap */}
        <div className='min-h-22 w-full' />
      </div>
    </Safearea>
  )
}

export default Main
