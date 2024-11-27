import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { tw } from '@/lib'
import PresentationProvider from '@/components/presentation/provider'
import 'aos/dist/aos.css'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  title: 'RFZ App',
  description: 'Pengembangan software dan web',
}

export default async function RootLayout({ children }: RC) {
  return (
    <html lang='en' className='antialiased'>
      <head>
        <link rel='icon' type='image/png' href='/icon.png' sizes='any' />
      </head>
      <body
        className={tw(
          inter.variable,
          'group/body min-w-80 text-base -tracking-base'
        )}
      >
        <PresentationProvider>{children}</PresentationProvider>
      </body>
    </html>
  )
}
