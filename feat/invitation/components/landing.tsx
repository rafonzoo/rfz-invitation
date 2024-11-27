import type {
  InvitationGallery,
  InvitationLanding,
} from '@/feat/invitation/schema'
import { tw } from '@/lib'
import LandingSticky from '@/feat/invitation/components/partials/landing/sticky'
import LandingContent from '@/feat/invitation/components/partials/landing/content'

type InvitationLandingProps = {
  type: string
  name: string
  landing: InvitationLanding
  gallery?: InvitationGallery
  guestName?: string
}

const InvitationLandingSection: RFA<InvitationLandingProps> = ({
  name,
  gallery,
  enableAnimation,
  landing,
  type,
  guestName,
  children,
}) => {
  return (
    <section
      id='section-landing'
      className={tw(
        'relative z-2 h-screen min-h-[663px]',
        !enableAnimation && '-mt-[57px]'
      )}
    >
      <LandingSticky {...{ enableAnimation, gallery }} />
      <LandingContent {...{ name, type, enableAnimation, landing, guestName }}>
        {children}
      </LandingContent>
    </section>
  )
}

export type { InvitationLandingProps }

export default InvitationLandingSection
