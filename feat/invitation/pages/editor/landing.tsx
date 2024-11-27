'use client'

import type { InvitationLandingProps } from '@/feat/invitation/components/landing'
import type { ColorRanges, Colors } from '@/lib'
import { useState } from 'react'
import { AArrowDown, AArrowUp, CircleHelp, Eclipse } from 'lucide-react'
import { colors, serialize, tw } from '@/lib'
import { Bucket, Config } from '@/core/config'
import {
  InvitationConfig,
  InvitationTierEnum,
  InvitationTypeEnum,
} from '@/feat/invitation/config'
import { updateGalleries, updateLanding } from '@/feat/invitation/action'
import { sanitizeInput } from '@/helpers/client'
import { invitationCreateNewPayload } from '@/feat/invitation/schema'
import { formEntries, keys, omit } from '@/core/utils'
import { isVideoExtension } from '@/core/helpers'
import Presentation from '@/components/presentation'
import ListGroup from '@/components/list/group'
import ListInput from '@/components/input/list'
import ListItem from '@/components/list/item'
import Slider from '@/components/slider'
import Button from '@/components/button'
import Switch from '@/components/switch'
import ButtonUpload from '@/components/upload/button'
import ButtonIcon from '@/components/button/icon'
import Popup from '@/components/popup'
import InvitationLandingSection from '@/feat/invitation/components/landing'
import LazyImage from '@/feat/invitation/components/image/lazy'
import Toast from '@/lib/toast'

type InvitationEditorLandingProps = InvitationLandingProps & {
  id: string
  tier: InvitationTierEnum
}

type EditorLandingConfigProps = Pick<
  InvitationLandingProps,
  'name' | 'type' | 'landing'
> & {
  imageUrl?: string
}

const EditorLandingConfig: RF<EditorLandingConfigProps> = ({
  name: defaultName,
  type,
  landing,
  imageUrl,
  children,
}) => {
  const isWedding = type === InvitationTypeEnum.pernikahan
  const title = defaultName.split(' ')
  const size = +landing.titleSize
  const maxScale = 20
  const colours = keys(colors)
  const indexes = keys(colors.zinc)

  const [nColor, iColor] = landing.titleColor.split('/')
  const [name, setName] = useState(defaultName)
  const [dark, setDark] = useState(!!landing.subtitleDark)
  const [bride, setBride] = useState(title?.[0] ?? 'Alice')
  const [groom, setGroom] = useState(title?.[1] ?? 'Jasper')
  const [scale, setScale] = useState(size)
  const [color, setColor] = useState<Colors>(nColor as 'zinc')
  const [index, setIndex] = useState<ColorRanges>(+iColor as 100)

  return (
    <div className='relative'>
      <input
        type='hidden'
        name='name'
        value={isWedding ? [bride, groom].join(' ') : name}
      />
      <div className='mb-6'>
        <div
          className={tw(
            'relative mx-auto flex h-[340px] w-[200px] flex-col items-center justify-end overflow-hidden rounded-field text-center text-[45px] font-bold tracking-tight',
            !imageUrl && 'bg-black'
          )}
        >
          {imageUrl &&
            (isVideoExtension(imageUrl) ? (
              <video
                src={imageUrl}
                playsInline
                muted
                className='absolute left-0 top-0 -z-1 h-full w-full object-cover object-center'
              />
            ) : (
              <LazyImage
                src={imageUrl}
                alt='Placeholder'
                className='absolute left-0 top-0 -z-1 h-full w-full object-cover object-center'
              />
            ))}
          <div
            className='mx-auto flex max-w-[88.5%] flex-col leading-[1] *:pb-1'
            style={{
              fontSize: `calc((100% - 10px) + ${scale}px)`,
              color: colors[color][index],
            }}
          >
            {isWedding ? (
              [bride, groom].map((coupleName, index) => (
                <span
                  key={index}
                  className={tw(
                    'mx-auto inline-block max-w-full truncate text-center',
                    !index && '-mb-1.5'
                  )}
                >
                  {coupleName || (!index ? 'Alice' : 'Jasper')}
                </span>
              ))
            ) : (
              <span className='overflow-hidden text-ellipsis'>
                {name || 'Alice Cullen'}
              </span>
            )}
          </div>
          <div className='mb-6 mt-4'>
            <div
              className={tw(
                'h-2 w-24 rounded-full',
                dark ? 'bg-black/25' : 'bg-white/25'
              )}
            />
            <div
              className={tw(
                'mx-auto mt-2 h-2 w-12 rounded-full',
                dark ? 'bg-black/25' : 'bg-white/25'
              )}
            ></div>
          </div>
        </div>
        {children}
      </div>
      <ListGroup>
        {isWedding ? (
          <>
            <ListInput
              value={bride}
              onChange={(e) => setBride(e.target.value)}
              schema={invitationCreateNewPayload.entries.name}
              onClear={() => setBride('')}
              placeholder='Alice'
              {...sanitizeInput({ exclude: ' ' })}
            />
            <ListInput
              value={groom}
              onChange={(e) => setGroom(e.target.value)}
              placeholder='Jasper'
              schema={invitationCreateNewPayload.entries.name}
              onClear={() => setGroom('')}
              {...sanitizeInput({ exclude: ' ' })}
            />
          </>
        ) : (
          <ListInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            schema={invitationCreateNewPayload.entries.name}
            placeholder='Alice Cullen'
            onClear={() => setName('')}
            {...sanitizeInput()}
          />
        )}
      </ListGroup>
      <ListGroup title='Personalisasi title'>
        <ListItem>
          <div className='flex flex-nowrap items-center'>
            <AArrowDown size={20} className='mr-2.5' />
            <Slider
              root={{
                className: tw('flex-grow !w-0'),
                name: 'titleSize',
                defaultValue: [scale],
                max: maxScale,
                step: 1,
                onValueChange: ([value]) => setScale(value),
              }}
            />
            <AArrowUp size={20} className='ml-2.5' />
          </div>
        </ListItem>
      </ListGroup>
      <ListGroup rootClasses='mt-2.5' disablePeerList>
        <div className='flex flex-nowrap space-x-2.5 overflow-x-auto px-4 py-4'>
          {colours.map((colour) => (
            <Button
              key={colour}
              type='button'
              onClick={() => setColor(colour)}
              data-active={colour === color}
              style={{ backgroundColor: colors[colour][500] }}
              className={tw(
                'block size-7 min-w-7 rounded-full',
                colour === color && 'ring ring-blue-300'
              )}
            />
          ))}
        </div>
        <div className='px-4'>
          <div className='py-4'>
            <Slider
              range={{ className: tw('!bg-transparent') }}
              thumb={{ className: tw('!w-3 !h-8 !rounded') }}
              track={{
                className: tw('!h-5'),
                style: {
                  background: `linear-gradient(to right, ${indexes
                    .map((idx) => colors[color][idx])
                    .join(', ')})`,
                },
              }}
              root={{
                defaultValue: [index],
                max: 900,
                min: 100,
                step: 100,
                onValueChange: ([index]) => setIndex(index as 100),
              }}
            />
          </div>
        </div>
        <input
          type='hidden'
          name='titleColor'
          value={[color, index].join('/')}
        />
      </ListGroup>
      <ListGroup title='Subtitle'>
        <ListInput
          name='subtitle'
          placeholder='Tulis teks subtitle'
          defaultValue={landing.subtitle}
          schema={invitationCreateNewPayload.entries.name}
        />
      </ListGroup>
      <ListGroup title='Setelan lainnya'>
        <ListItem
          aria-controls='subtitleDark'
          prefix={<Eclipse size={20} />}
          suffix={
            <Switch
              id='subtitleDark'
              checked={dark}
              onValueChange={setDark}
              onClick={(e) => e.preventDefault()}
            />
          }
        >
          Gelapkan subtitle
        </ListItem>
      </ListGroup>
    </div>
  )
}

const InvitationEditorLanding: RF<InvitationEditorLandingProps> = ({
  id,
  type,
  tier,
  name,
  gallery,
  landing,
}) => {
  const [open, onOpenChange] = useState(false)
  const [locked, setLocked] = useState(false)

  function onOpenAutoFocus(e: Event) {
    const sheet = e.currentTarget as HTMLElement
    const target = sheet.querySelector<HTMLElement>('button[data-active=true]')
    const parent = target?.parentElement

    e.preventDefault()
    if (!target || !parent) {
      return
    }

    parent.scrollBy({
      left: target.offsetLeft - (parent.clientWidth / 2 - 30) - 16,
    })
  }

  function safeToClose(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest('form')
    if (!form) return true

    const data = formEntries(new FormData(form), true)
    const entries = {
      ...omit(data, 'id'),
      subtitleDark: !!data['subtitleDark'],
    }

    const previous = { name, ...landing }
    const isGood = keys(entries).every(
      (key) => entries[key] === previous[key as keyof typeof previous]
    )

    if (!isGood) {
      return
    }

    e.preventDefault()
    onOpenChange(false)
  }

  async function updateGallery(payload: any) {
    const { errorMessage } = await updateGalleries(
      serialize({
        id,
        role: Config.GalleryType.InvitationHero,
        ...payload,
      })
    )

    if (errorMessage) {
      return Toast.error(errorMessage)
    }
  }

  async function submitForm(form: FormData) {
    setLocked(true)

    const { errorMessage } = await updateLanding(form)
    setLocked(false)

    if (errorMessage) {
      return Toast.error(errorMessage)
    }

    onOpenChange(false)
  }

  return (
    <InvitationLandingSection
      {...{ type, name, gallery, landing }}
      enableAnimation={false}
    >
      <div className='absolute left-0 w-full -translate-y-3 md:-translate-y-2'>
        <div className='relative mx-auto size-10'>
          <span className='pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-80'></span>
          <Presentation
            {...{ locked }}
            title={{ children: 'Landing' }}
            root={{ open, onOpenChange }}
            content={{ onOpenAutoFocus }}
            wrapperClasses='before:my-0'
            trigger={{
              'aria-label': 'Edit landing',
              title: 'Setelan utama',
              className: 'relative z-1 inline-flex size-10 items-center justify-center rounded-full bg-primary text-white', // prettier-ignore
            }}
          >
            <form action={submitForm}>
              <EditorLandingConfig
                {...{ name, type, landing }}
                imageUrl={gallery?.url}
              >
                <ButtonUpload
                  bucket={Bucket.Invitation}
                  folder={id}
                  defaultValue={gallery?.fileId}
                  maxSize={InvitationConfig[tier].UploadMaxSize}
                  wrapperClasses='mx-auto mt-3 flex flex-nowrap justify-center items-center'
                  removeClasses='absolute top-2.5 left-1/2 translate-x-[calc(-50%_+_80px)]'
                  onComplete={updateGallery}
                  format={
                    InvitationConfig[tier].UploadMaxSize > 10
                      ? ['image/png', 'image/jpg', 'image/jpeg', 'video/*']
                      : ['image/png', 'image/jpg', 'image/jpeg']
                  }
                >
                  <Popup
                    root={{ modal: true }}
                    content={{
                      className: tw('max-w-[270px]'),
                      side: 'top',
                      sideOffset: 6,
                      collisionPadding: 24,
                    }}
                    trigger={{
                      asChild: true,
                      children: (
                        <ButtonIcon
                          aria-label='Mengenai media'
                          className='-ml-6 mr-2 text-zinc-500'
                        >
                          <CircleHelp size={16} />
                        </ButtonIcon>
                      ),
                    }}
                  >
                    <p className='text-xs tracking-base'>
                      Di layar desktop, media akan mengisi lebar dan tinggi
                      layar.
                    </p>
                  </Popup>
                </ButtonUpload>
              </EditorLandingConfig>
              <input type='hidden' name='id' value={id} />
              <Button
                className='absolute right-3 top-4 text-primary'
                onClick={safeToClose}
              >
                Save
              </Button>
            </form>
          </Presentation>
        </div>
      </div>
    </InvitationLandingSection>
  )
}

export default InvitationEditorLanding
