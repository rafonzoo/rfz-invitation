import { capitalizeEach, unstrip } from '@/core/utils'
import { InvitationConfig, InvitationTypeEnum } from '@/feat/invitation/config'

type InvitationPackage = keyof typeof InvitationConfig

export function isPaidVersion<T extends InvitationPackage>(tier: T) {
  return !!getInvitationPrice(tier)
}

export function getInvitationPrice<T extends InvitationPackage>(tier: T) {
  if (!(tier in InvitationConfig)) {
    return InvitationConfig.Starter.Price
  }
  return InvitationConfig[tier].Price
}

export function getInvitationGuest<T extends InvitationPackage>(tier: T) {
  if (!(tier in InvitationConfig)) {
    return InvitationConfig.Starter.MaxGuest
  }
  return InvitationConfig[tier].MaxGuest
}

export function capitalUnstrip(type: string) {
  return capitalizeEach(unstrip(type))
}

export function formattedSlug(slug: string) {
  return capitalUnstrip(slug).replace(/ Dan /g, ' dan ')
}

export function getColorByType(type: unknown) {
  const key = type as keyof typeof colorClasses
  const colorClasses = {
    [InvitationTypeEnum.khitanan]: 'text-cyan-500',
    [InvitationTypeEnum.pernikahan]: 'text-pink-500',
    [InvitationTypeEnum.rapat]: 'text-primary',
    [InvitationTypeEnum.reuni]: 'text-amber-500',
    [InvitationTypeEnum.tasyakuran]: 'text-violet-500',
    [InvitationTypeEnum['ulang-tahun']]: 'text-teal-500',
  }

  return key in colorClasses ? colorClasses[key] : ''
}
