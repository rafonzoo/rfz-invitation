'use client'

import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'
import { tw } from '@/lib'
import Button from '@/components/button'

type InvitationMusicProps = {
  url?: string
}

const InvitationMusic: RFZ<InvitationMusicProps> = ({ url = '' }) => {
  const [isPlay, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const AudioIcon = isPlay ? Pause : Play

  if (!url) {
    return null
  }

  return (
    <div className='fixed left-0 top-4 z-3 w-full'>
      <div className='mx-auto flex max-w-175 items-center justify-between lg:max-w-245 md-max:px-4'>
        <Button
          aria-label='Mainkan musik'
          className='flex items-center rounded-full border border-zinc-500/70 bg-black/50 py-2 pl-2.5 pr-4 text-white backdrop-blur'
          onClick={() => {
            const target = audioRef.current

            if (!target) {
              return
            }

            setIsPlaying((prev) => !prev)

            const isPlayed = !!target.currentTime && !target.paused
            target[isPlayed ? 'pause' : 'play']()
          }}
        >
          <AudioIcon
            size={16}
            strokeWidth={0}
            className={tw(
              'mr-1 fill-white',
              isPlay ? '-translate-x-[0.5px]' : 'translate-x-px'
            )}
          />
          <span className='text-sm font-semibold tracking-normal'>Audio</span>
        </Button>
        <audio ref={audioRef} src={url} preload='none' />
      </div>
    </div>
  )
}

export default InvitationMusic
