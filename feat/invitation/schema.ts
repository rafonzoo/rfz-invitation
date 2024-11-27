import type { Invitation } from '@prisma/client'
import type { InferInput } from 'valibot'
import {
  array,
  boolean,
  enum as enum_,
  literal,
  nonEmpty,
  number,
  object,
  optional,
  partial,
  pick,
  pipe,
  string,
  union,
  url,
} from 'valibot'
import { requiredStringType, uploadResponseType } from '@/core/schema'
import {
  InvitationTierEnum,
  InvitationTypeEnum,
} from '@/feat/invitation/config'

export type InvitationGallery = InferInput<typeof invitationGalleryType>
export const invitationGalleryType = object({
  ...uploadResponseType.entries,
  ...object({ role: string(), index: number() }).entries,
})

export type InvitationGalleries = InferInput<typeof invitationGalleriesType>
export const invitationGalleriesType = array(invitationGalleryType)

export type InvitationKeys = InferInput<typeof invitationKeysType>
export const invitationKeysType = array(
  object({
    id: number(),
    text: string(),
  })
)

export type InvitationEvent = InferInput<typeof invitationEventType>
export const invitationEventType = object({
  id: number(),
  date: string(),
  name: requiredStringType(3, 60),
  mapUrl: pipe(string(), nonEmpty('Mohon diisi'), url('URL tidak valid')),
  address: requiredStringType(),
})

export type InvitationEvents = InferInput<typeof invitationEventsType>
export const invitationEventsType = array(invitationEventType)

export type InvitationMeta = InferInput<typeof invitationMetaType>
export const invitationMetaType = object({
  title: requiredStringType(3, 60),
  description: requiredStringType(3, 60),
  templateMessage: requiredStringType(20),
})

export type InvitationLanding = InferInput<typeof invitationLandingType>
export const invitationLandingType = object({
  titleSize: string(),
  titleColor: string(),
  subtitle: requiredStringType(3, 60),
  subtitleDark: boolean(),
})

export type InvitationSettings = InferInput<typeof invitationSettingsType>
export const invitationSettingsType = object({
  meta: invitationMetaType,
  landing: invitationLandingType,
})

// prettier-ignore
export type InvitationResponse = InferInput<typeof invitationResponseType>
export const invitationResponseType = object({
  referenceId: string(),
  alias: string(),
  comment: string(),
  attendance: string(),
  createdAt: string(),
  outOfTopic: boolean(),
  length: optional(string()),
})

export type InvitationResponses = InferInput<typeof invitationResponsesType>
export const invitationResponsesType = array(invitationResponseType)

export type InvitationGuest = InferInput<typeof invitationGuestType>
export const invitationGuestType = object({
  id: string(),
  name: requiredStringType(3, 60),
  role: string(),
  imageUrl: string(),
})

export type InvitationGuests = InferInput<typeof invitationGuestsType>
export const invitationGuestsType = array(invitationGuestType)

// prettier-ignore
type Omitted = Omit<Invitation, 'pid' | 'tier' | 'settings' | 'galleries' | 'events' | 'keys' | 'gift' | 'guests' | 'responses'>
export type InvitationDetail = Omitted & {
  pid?: string
  tier: InvitationTierEnum
  settings: InvitationSettings
  guests: InvitationGuests
  responses: InvitationResponses
  gift: string
  keys: InvitationKeys
  events: InvitationEvents
  galleries: InvitationGalleries
}

export const invitationTransactionType = object({
  pid: string(),
})

// State
export type InvitationCreateNewPayload = InferInput<
  typeof invitationCreateNewPayload
>
export const invitationCreateNewPayload = object({
  type: pipe(
    string(),
    nonEmpty('Mohon dipilih'),
    union([enum_(InvitationTypeEnum)])
  ),
  tier: pipe(
    string(),
    nonEmpty('Mohon dipilih'),
    union([enum_(InvitationTierEnum)])
  ),
  name: requiredStringType(3, 60),
  pid: optional(string()),
  id: optional(string()),
})

export type InvitationGalleryPayload = InferInput<
  typeof invitationGalleryPayloadType
>
export const invitationGalleryPayloadType = object({
  // Required for action
  id: string(),

  // Required to remove but not for upload
  removedFileId: optional(string()),

  // Required to upload but not for remove
  ...partial(invitationGalleryType).entries,
})

export type InvitationGuestPayload = InferInput<
  typeof invitationGuestPayloadType
>
export const invitationGuestPayloadType = object({
  id: string(),
  invitationId: string(),
  entries: string(),
})

export type InvitationResponsePayload = InferInput<
  typeof invitationResponsePayloadType
>
export const invitationResponsePayloadType = object({
  reference: string(),
  comment: requiredStringType(10),
  alias: requiredStringType(3),
  length: optional(string()),
  attendance: pipe(
    string(),
    nonEmpty('Mohon diisi'),
    union([literal('ok'), literal('no')])
  ),
})

export type InvitationLandingPayload = InferInput<
  typeof invitationLandingPayloadType
>
export const invitationLandingPayloadType = object({
  ...pick(invitationCreateNewPayload, ['name']).entries,
  ...pick(invitationSettingsType, ['landing']).entries.landing.entries,
})
