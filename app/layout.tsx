import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { tw } from '@app/shared/lib'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }: RC) {
  return (
    <html lang='en' className='antialiased'>
      <body
        className={tw(
          inter.variable,
          'min-w-[320px] text-base -tracking-base text-black [.dark_&]:bg-black [.dark_&]:text-white'
        )}
      >
        {children}
      </body>
    </html>
  )
}
