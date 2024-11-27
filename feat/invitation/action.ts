'use server'

import type { Invoice } from 'xendit-node/invoice/models'
import { revalidatePath } from 'next/cache'
import { intersect, parse, pick } from 'valibot'
import { v4 as uuidv4 } from 'uuid'
import { serialize } from '@/lib'
import {
  invitationCreateNewPayload,
  invitationGalleriesType,
  invitationGalleryPayloadType,
  invitationGuestPayloadType,
  invitationGuestType,
  invitationGuestsType,
  invitationLandingPayloadType,
  invitationMetaType,
  invitationResponsePayloadType,
  invitationResponsesType,
  invitationSettingsType,
  invitationTransactionType,
} from '@/feat/invitation/schema'
import { prisma } from '@/core/db'
import { Bucket, Config, Routes } from '@/core/config'
import {
  InvitationConfig,
  InvitationTierEnum,
  InvitationTypeEnum,
} from '@/feat/invitation/config'
import { wtf } from '@/helpers/server'
import { formEntries, omit } from '@/core/utils'
import {
  INVITATION_DEFAULT_TEMPLATE_DISPLAY_NAME,
  INVITATION_DEFAULT_TEMPLATE_EVENTS,
  INVITATION_DEFAULT_TEMPLATE_KEYS,
  INVITATION_WEDDING_TEMPLATE_DISPLAY_NAME,
  INVITATION_WEDDING_TEMPLATE_EVENTS,
  INVITATION_WEDDING_TEMPLATE_KEYS,
} from '@/feat/invitation/dummy'
import { capitalize, getRandomDigits, getRandomLetters } from '@/core/utils'
import { getCheckUser } from '@/feat/auth/action'
import {
  createInvoice,
  expireInvoice,
  searchInvoice,
} from '@/feat/invoice/action'
import {
  capitalUnstrip,
  formattedSlug,
  getInvitationPrice,
  isPaidVersion,
} from '@/feat/invitation/helpers'
import { invoicePayloadType } from '@/feat/invoice/schema'
import DayJS from '@/lib/dayjs'

export async function submitComment(form: FormData) {
  await new Promise((res) => setTimeout(res, 500))

  try {
    const { reference, ...payload } = parse(
      invitationResponsePayloadType,
      formEntries(form)
    )

    const [invitationId, guestId] = reference.split('-')
    const current = await prisma.invitation.findUniqueOrThrow({
      where: { id: invitationId },
      select: { responses: true, guests: true },
    })

    const prevResponse = parse(invitationResponsesType, current.responses)
    const response = {
      ...payload,
      alias: encodeURIComponent(payload.alias),
      comment: encodeURIComponent(payload.comment),
      referenceId: guestId,
      outOfTopic: false,
      createdAt: DayJS().tz().format('MMMM DD, YYYY · HH:mm'),
    }

    if (prevResponse.some((prev) => prev.referenceId === guestId)) {
      revalidatePath(Routes.invitationEditor)
      revalidatePath(Routes.invitationPublic)

      return { data: null, errorMessage: 'Anda sudah berkomentar.' }
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        responses: [...prevResponse, response],
      },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function removeComment(form: FormData) {
  await getCheckUser()

  try {
    const { id, referenceId } = formEntries(form)
    if (!id || !referenceId) {
      throw new Error('No id provided')
    }
    const current = await prisma.invitation.findUniqueOrThrow({
      where: { id },
    })

    const responses = parse(invitationResponsesType, current.responses)
    await prisma.invitation.update({
      where: { id },
      data: {
        responses: responses.filter(
          (response) => referenceId !== response.referenceId
        ),
      },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function toggleFlagComment(form: FormData) {
  await getCheckUser()

  try {
    const { id, referenceId } = formEntries(form)

    if (!id || !referenceId) {
      throw new Error('No id provided')
    }

    const current = await prisma.invitation.findUniqueOrThrow({
      where: { id },
    })

    const responses = parse(invitationResponsesType, current.responses)
    await prisma.invitation.update({
      where: { id },
      data: {
        responses: responses.map((item) => ({
          ...item,
          outOfTopic:
            item.referenceId === referenceId
              ? !item.outOfTopic
              : item.outOfTopic,
        })),
      },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function validateUpgrade(form: FormData) {
  const { email } = await getCheckUser()

  try {
    const { tier } = parse(
      pick(invitationCreateNewPayload, ['tier']),
      formEntries(form)
    )

    const isPaid = isPaidVersion(tier)

    if (isPaid) {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email },
        include: {
          purchases: { where: { status: 'PENDING' } },
        },
      })

      if (!!user.purchases.length) {
        return {
          data: null,
          errorMessage: 'Selesaikan transaksi terakhir sebelum membuat transaksi baru.', // prettier-ignore
        }
      }
    }

    if (!isPaid) {
      const max = 3 // @TODO
      const count = await prisma.invitation.findMany({
        where: { email, AND: [{ pid: null }] },
        select: { expiredAt: true },
      })

      const freeVersion = count.filter(({ expiredAt }) =>
        DayJS().tz().isBefore(DayJS(expiredAt).tz())
      )

      if (freeVersion.length >= max) {
        return {
          data: null,
          errorMessage: `Maksimal undangan untuk Paket ${InvitationTierEnum.Starter} sudah tercapai.`,
        }
      }
    }

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function createOrUpgrade(form: FormData) {
  await getCheckUser()

  try {
    const {
      tier,
      type,
      id: initialId,
    } = parse(invitationCreateNewPayload, formEntries(form))

    if (initialId) {
      const validate = await validateUpgrade(serialize({ tier }))

      if (validate.errorMessage) {
        return {
          data: null,
          errorMessage: validate.errorMessage,
        }
      }
    }

    const { data: invitation, errorMessage: currentError } = !initialId
      ? await createNewOne(form)
      : {
          errorMessage: '',
          data: await prisma.invitation.findUniqueOrThrow({
            where: { id: initialId },
            select: { id: true, slug: true },
          }),
        }

    if (!invitation || currentError) {
      return { data: null, errorMessage: currentError }
    }

    const price = getInvitationPrice(tier)
    const purchaseData = parse(invoicePayloadType, {
      type: 'invitation',
      amount: Config.FeeFixed + price,
      fees: [{ type: 'Biaya layanan', value: Config.FeeFixed }],
      items: [
        {
          name: `Paket ${capitalize(tier)}`,
          price,
          quantity: 1,
          referenceId: invitation.id,
          // DO NOT CHANGE THE ORDER OR YOU'LL BE FIRED!!!
          category: [tier, invitation.slug, invitation.id, type].join(':'),
        },
      ],
    })

    const id = invitation.id
    const { data, errorMessage } = await createTransaction(
      serialize({
        ...purchaseData,
        fees: JSON.stringify(purchaseData.fees),
        items: JSON.stringify(purchaseData.items),
      })
    )

    if (!data || errorMessage) {
      if (!initialId) await prisma.invitation.delete({ where: { id } })
      return { data: null, errorMessage }
    }

    await prisma.invitation.update({
      where: { id },
      data: { pending: !!initialId, pid: data.pid },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationKoleksi)
    revalidatePath(Routes.invitationTransaction)

    return { data, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function createNewOne(form: FormData) {
  const { email } = await getCheckUser()

  let displayName = INVITATION_DEFAULT_TEMPLATE_DISPLAY_NAME
  let keys = INVITATION_DEFAULT_TEMPLATE_KEYS
  let events = INVITATION_DEFAULT_TEMPLATE_EVENTS

  try {
    const { name, tier, type, pid } = parse(
      invitationCreateNewPayload,
      formEntries(form)
    )

    // Always re-validate
    const validate = await validateUpgrade(serialize({ tier }))
    if (validate.errorMessage) {
      return {
        data: null,
        errorMessage: validate.errorMessage,
      }
    }

    const randomize = () => {
      return (
        getRandomLetters(2) +
        getRandomDigits(1) +
        getRandomLetters(2) +
        getRandomDigits(1)
      )
    }

    let slug = name.trim().replace(/ /g, '-')
    let id = randomize()

    while (!!(await prisma.invitation.findUnique({ where: { id } }))) {
      id = randomize()
    }

    const expiredAt = !InvitationConfig[tier].ExpireAt
      ? DayJS().tz().add(7, 'day')
      : DayJS().tz().add(InvitationConfig[tier].ExpireAt, 'month')

    if (type === InvitationTypeEnum.pernikahan) {
      displayName = INVITATION_WEDDING_TEMPLATE_DISPLAY_NAME
      keys = INVITATION_WEDDING_TEMPLATE_KEYS
      events = INVITATION_WEDDING_TEMPLATE_EVENTS
    }

    const capitalType = capitalUnstrip(type)
    const settings = parse(invitationSettingsType, {
      meta: {
        title: [capitalType, formattedSlug(slug)].join(' '),
        description: expiredAt.format('dddd, D MMMM YYYY'),
        templateMessage:
          `Halo *::name::*! Anda telah diundang untuk menghadiri acara ::title:: pada _::description::_\r\n` +
          `\r\nUntuk informasi lebih lanjut silahkan buka halaman undangan kami: ::url::\r\n` +
          `\r\nBesar harapan kami agar Anda dapat datang atau memberikan dukungan. Terima kasih!` +
          `\r\n`,
      },
      landing: {
        titleColor: 'zinc/100',
        titleSize: '10',
        subtitle: 'Undangan kepada Yth:',
        subtitleDark: false,
      },
    })

    const gift = `(OVO) John Doe: 000000000\r\n` + `(Shopee) John: 000000000`
    const newInvitation = await prisma.invitation.create({
      data: {
        id,
        slug,
        type,
        tier,
        email,
        name: displayName,
        pending: false,
        onHold: isPaidVersion(tier),
        expiredAt: new Date(expiredAt.format()),
        galleries: [],
        gift,
        keys,
        pid,
        events,
        settings,
      },
    })

    revalidatePath(Routes.invitationKoleksi)

    if (isPaidVersion(tier)) {
      return { data: newInvitation, errorMessage: '' }
    }

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function removeInvitation(form: FormData) {
  await getCheckUser()

  try {
    const id = form.get('id')?.toString()
    const pid = form.get('pid')?.toString()
    const isDev = process.env.NEXT_PUBLIC_SITE_ENV !== 'production'

    if (!id) {
      return { data: null, errorMessage: 'Forbidden: Unauthorized.' }
    }

    const supabase = (await import('@/lib/supabase')).default()
    const { data, error } = await supabase.storage
      .from(Bucket.Invitation)
      .list(['uploads', id].join('/'))

    if (error) {
      return { data: null, errorMessage: error.message }
    }

    if (!!data.length) {
      const { error: removeError } = await supabase.storage
        .from(Bucket.Invitation)
        .remove(data.map((item) => ['uploads', id, item.name].join('/')))

      if (removeError) {
        return { data: null, errorMessage: removeError.message }
      }
    }

    if (isDev && pid) {
      await prisma.purchase.delete({ where: { id: pid } })
      revalidatePath(Routes.invitationTransaction)
    }

    await prisma.invitation.delete({ where: { id } })

    revalidatePath(Routes.invitationKoleksi)
    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function updateLanding(form: FormData) {
  await getCheckUser()

  try {
    const { id, ...data } = formEntries(form)
    const { name, ...landing } = parse(invitationLandingPayloadType, {
      ...data,
      subtitleDark: !!data['subtitleDark'],
    })

    const current = await prisma.invitation.findUniqueOrThrow({
      where: { id },
      select: { settings: true },
    })

    await prisma.invitation.update({
      where: { id },
      data: {
        name,
        settings: {
          ...parse(invitationSettingsType, current.settings),
          landing,
        },
      },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function updateGalleries(form: FormData) {
  await getCheckUser()

  try {
    const data = formEntries(form)
    const {
      // Required to perform
      id,

      // Required to remove
      removedFileId,

      // Required to upload
      role,
      index,
      fileId,
      url,
    } = parse(invitationGalleryPayloadType, {
      ...data,
      index: !!data.index ? +data.index : 0,
    })

    const isUploading = !!fileId && !!url && role && typeof index === 'number'
    const current = await prisma.invitation.findUnique({
      where: { id },
    })

    if (!current) {
      return { data: null, errorMessage: 'TypeError: Client side exception.' }
    }

    let galleries = parse(invitationGalleriesType, current.galleries)

    if (removedFileId) {
      galleries = galleries.filter((item) => item.fileId !== removedFileId)
    }

    if (isUploading) {
      galleries = [...galleries, { fileId, url, role, index }]
    }

    await prisma.invitation.update({
      where: { id },
      data: { galleries },
    })

    if (role === Config.GalleryType.InvitationMeta) {
      revalidatePath(Routes.invitationKoleksi)
      revalidatePath(Routes.invitationTransaction)
    }

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function updateKeyEvents(form: FormData) {
  await getCheckUser()

  const payload = formEntries(form)
  const entries = Object.keys(payload)
  const entryKeys = entries.filter((key) => key.includes('description'))
  const entryEvents = [
    ...new Set(
      entries
        .filter((key) => key.includes('event'))
        .map((key) => +key.split('-')[1])
    ),
  ]

  try {
    const id = payload.id

    if (!id) {
      return { data: null, errorMessage: 'Forbidden: Unauthorized.' }
    }

    const keys = entryKeys.map((key) => ({
      id: +key.split('-')[1],
      text: payload[key] ?? '',
    }))

    const events = entryEvents.map((id) => ({
      id: Number(payload[`event-${id}-id`] ?? ''),
      name: payload[`event-${id}-name`] ?? '',
      mapUrl: payload[`event-${id}-mapUrl`] ?? '',
      address: payload[`event-${id}-address`] ?? '',
      date: DayJS(payload[`event-${id}-date`] ?? '')
        .tz()
        .format('D MMMM YYYY'),
    }))

    await prisma.invitation.update({
      where: { id },
      data: { keys, events },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function updatePhotoOrder(form: FormData) {
  await getCheckUser()

  const data = formEntries(form)

  if (!data.id) {
    return { data: null, errorMessage: 'Forbidden: Unauthorized.' }
  }

  function _construct(role: string, current: unknown) {
    const galleries = parse(invitationGalleriesType, current)

    return Object.keys(data)
      .filter((key) => key.includes(role))
      .map((key, index) => ({
        ...galleries.find((item) => item.fileId === data[key])!,
        index,
      }))
  }

  try {
    const current = await prisma.invitation.findUnique({
      where: { id: data.id },
    })

    if (!current) {
      return { data: null, errorMessage: 'TypeError: Client side exception.' }
    }

    // Omit the roles
    const without = parse(invitationGalleriesType, current.galleries).filter(
      (item) =>
        !Object.keys(data)
          .filter((key) => typeof key === 'string')
          .some((key) => key.includes(item.role))
    )

    await prisma.invitation.update({
      where: { id: data.id },
      data: {
        // prettier-ignore
        galleries: [
          ...without,
          ..._construct(Config.GalleryType.InvitationCarousel, current.galleries),
          ..._construct(Config.GalleryType.InvitationMarqueeTop, current.galleries),
          ..._construct(Config.GalleryType.InvitationMarqueeBottom, current.galleries),
        ],
      },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function updateMeta(form: FormData) {
  await getCheckUser()

  try {
    const { id, ...data } = formEntries(form)

    if (!id) {
      return { data: null, errorMessage: 'Forbidden: Unauthorized.' }
    }

    const current = await prisma.invitation.findUnique({
      where: { id },
    })

    if (!current) {
      return { data: null, errorMessage: 'TypeError: Client side exception.' }
    }

    await prisma.invitation.update({
      where: { id },
      data: {
        settings: {
          ...parse(invitationSettingsType, current.settings),
          meta: parse(invitationMetaType, data),
        },
      },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function upsertGuest(form: FormData) {
  await getCheckUser()

  try {
    const { invitationId, ...guest } = parse(
      intersect([
        invitationGuestType,
        pick(invitationGuestPayloadType, ['invitationId']),
      ]),
      { ...formEntries(form), imageUrl: '' }
    )

    // prettier-ignore
    const { guests: previousGuest, responses } = (
      await prisma.invitation.findUniqueOrThrow({
        where: { id: invitationId },
        select: { guests: true, responses: true },
      })
    )

    const guests = parse(invitationGuestsType, previousGuest)
    const current = guests.find(({ id }) => id === guest.id)

    if (
      (current ? guests.filter((item) => item.id !== current.id) : guests).some(
        ({ name }) => name === guest.name
      )
    ) {
      return { data: null, errorMessage: 'Nama tamu sudah ada.' }
    }

    if (current) {
      // Update
      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          guests: guests.map(({ id, ...res }) =>
            id === guest.id ? { id, ...omit(guest, 'id') } : { id, ...res }
          ),
        },
      })
    } else {
      // Add new
      let id = getRandomLetters(4) + getRandomDigits(2)

      while (guests.some(({ id: gid }) => gid === guest.id)) {
        id = getRandomLetters(4) + getRandomDigits(2)
      }

      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          guests: [...guests, { ...guest, id }],
        },
      })
    }

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function removeGuest(form: FormData) {
  await getCheckUser()

  try {
    const { id, invitationId } = parse(
      pick(invitationGuestPayloadType, ['id', 'invitationId']),
      formEntries(form)
    )

    const current = await prisma.invitation.findUniqueOrThrow({
      select: { guests: true, responses: true },
      where: { id: invitationId },
    })

    const previous = parse(invitationGuestsType, current.guests)
    const responses = parse(invitationResponsesType, current.responses)

    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        guests: previous.filter((guest) => guest.id !== id),
        responses: id
          ? responses.filter(({ referenceId }) => referenceId !== id)
          : responses,
      },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function addBulkGuest(form: FormData) {
  await getCheckUser()

  try {
    const { entries, invitationId } = parse(
      pick(invitationGuestPayloadType, ['entries', 'invitationId']),
      formEntries(form, true)
    )

    const current = await prisma.invitation.findUniqueOrThrow({
      select: { tier: true, guests: true },
      where: { id: invitationId },
    })

    const previous = parse(invitationGuestsType, current.guests)
    const payload = JSON.parse(entries ?? '') as string[]
    const guests = payload
      .filter((name) => !previous.some((prev) => prev.name === name))
      .map((name) => {
        let id = getRandomLetters(4) + getRandomDigits(2)

        while (previous.some((guest) => guest.id === id)) {
          id = getRandomLetters(4) + getRandomDigits(2)
        }

        return { id, name, role: 'regular', imageUrl: '' }
      })

    const tier = current.tier as InvitationTierEnum
    const result = [...previous, ...guests].slice(
      0,
      InvitationConfig[tier].MaxGuest
    )

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { guests: result },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function updateGift(form: FormData) {
  await getCheckUser()

  try {
    const { id, gift } = formEntries(form)

    if (!id) {
      throw new Error('"id" is not defined.')
    }

    await prisma.invitation.update({
      where: { id },
      data: { gift },
    })

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationPublic)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function removeTransaction(form: FormData) {
  await getCheckUser()

  try {
    const { pid } = parse(invitationTransactionType, formEntries(form))
    const current = await prisma.purchase.findUniqueOrThrow({
      where: { id: pid },
    })

    const purchaseDetail = current.detail as unknown as Invoice
    if (!purchaseDetail.id) {
      throw new Error('"purchase.detail.id" is not defined.')
    }

    const { data: invoice, errorMessage } = await expireInvoice(
      serialize({ invoiceId: purchaseDetail.id })
    )

    if (!invoice || errorMessage) {
      return { data: null, errorMessage }
    }

    await prisma.$transaction([
      prisma.invitation.deleteMany({ where: { pid, onHold: true } }),
      prisma.invitation.updateMany({
        where: { pid, pending: true },
        data: { pending: false },
      }),
      prisma.purchase.delete({ where: { id: pid } }),
    ])

    revalidatePath(Routes.invitationEditor)
    revalidatePath(Routes.invitationKoleksi)
    revalidatePath(Routes.invitationTransaction)

    return { data: null, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}

export async function updateTransaction(form: FormData) {
  await getCheckUser()

  try {
    const { pid } = parse(invitationTransactionType, formEntries(form))
    const current = await prisma.purchase.findUniqueOrThrow({
      where: { id: pid },
    })

    const purchaseDetail = current.detail as unknown as Invoice
    if (!purchaseDetail.id) {
      throw new Error('"purchase.detail.id" is not defined.')
    }

    const { data: invoice, errorMessage } = await searchInvoice(
      serialize({ invoiceId: purchaseDetail.id })
    )

    const invalidate = () => {
      revalidatePath(Routes.invitationEditor)
      revalidatePath(Routes.invitationKoleksi)
      revalidatePath(Routes.invitationTransaction)
    }

    if (!invoice || errorMessage) {
      return { data: null, errorMessage }
    }

    if (invoice.status === 'EXPIRED') {
      await prisma.$transaction([
        prisma.invitation.deleteMany({ where: { pid, onHold: true } }),
        prisma.invitation.updateMany({
          where: { pid, pending: true },
          data: { pending: false, pid: null },
        }),
        prisma.purchase.delete({ where: { id: pid } }),
      ])

      invalidate()
      return {
        data: { success: false, expired: true },
        errorMessage: 'Pembayaran sudah kadaluarsa, silahkan buat pembayaran baru.', // prettier-ignore
      }
    }

    if (['PAID', 'SETTLED'].includes(invoice.status)) {
      const tier = invoice.items?.[0].category?.split(':')?.[0]

      if (!tier || !(tier in InvitationConfig)) {
        throw new Error('Tier is not the member of "InvitationConfig"')
      }

      await prisma.$transaction([
        prisma.purchase.update({
          where: { id: pid },
          data: {
            status: invoice.status,
            updatedAt: new Date(),
            detail: {
              ...purchaseDetail,
              status: invoice.status,
              updated: invoice.updated,
            } as any,
          },
        }),
        prisma.invitation.updateMany({
          where: { pid },
          data: {
            tier,
            onHold: false,
            pending: false,
            expiredAt: new Date(
              DayJS()
                .tz()
                .add(InvitationConfig[tier as 'Premium'].ExpireAt, 'month')
                .format()
            ),
          },
        }),
      ])

      invalidate()
      return {
        data: { success: true, expired: false },
        errorMessage: '',
      }
    }

    return {
      data: { success: false, expired: false },
      errorMessage: 'Pembayaran belum terverifikasi.',
    }
  } catch (e) {
    return wtf(e)
  }
}

export async function createTransaction(form: FormData) {
  const { email } = await getCheckUser()

  try {
    const payload = formEntries<true>(form)
    const { type, amount, fees, items } = parse(invoicePayloadType, {
      ...payload,
      amount: +payload.amount,
      fees: JSON.parse(payload.fees),
      items: JSON.parse(payload.items),
    })

    const { id, ...user } = await prisma.user.findUniqueOrThrow({
      where: { email },
    })

    const externalId = uuidv4()
    const { data: invoice, errorMessage } = await createInvoice(
      serialize({
        amount,
        externalId,
        fees: JSON.stringify(fees),
        items: JSON.stringify(items),
        customer: JSON.stringify({
          id,
          email,
          givenNames: user.name,
        }),
      })
    )

    if (!invoice || errorMessage) {
      return { data: null, errorMessage }
    }

    const { id: pid, detail } = await prisma.purchase.create({
      select: { id: true, detail: true },
      data: {
        id: externalId,
        type,
        amount: amount + '',
        uid: id,
        status: invoice.status,
        detail: omit(
          invoice,
          'availableBanks',
          'availableDirectDebits',
          'availableEwallets',
          'availablePaylaters',
          'availableQrCodes',
          'availableRetailOutlets'
        ) as any,
      },
    })

    const details = detail as unknown as Invoice
    return { data: { pid, url: details.invoiceUrl }, errorMessage: '' }
  } catch (e) {
    return wtf(e)
  }
}
