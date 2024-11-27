// DO NOT IMPORT ANYTHING EXCEPT TYPE OR YOU WILL BE FIRED!

if (!process.env.NEXT_PUBLIC_BUCKET) {
  throw new Error('Do you forget include bucket path?')
}

const bucket: 'U' = process.env.NEXT_PUBLIC_BUCKET as unknown as 'U'

export const Routes = {
  homepage: '/',
  authSignin: '/api/auth/signin' /** /akun/masuk */,
  authSignup: '/akun/daftar',
  invitation: '/undangan',
  invitationPricing: '/undangan/harga',
  invitationPublic: '/undangan/p',
  invitationEditor: '/undangan/u/editor',
  invitationKoleksi: '/undangan/u/koleksi',
  invitationTransaction: '/undangan/u/transaksi',
} as const

export const API = {
  Uploads: '/api/uploads',
} as const

export const Config = {
  MaxUploadSizeMB: 2,
  MusicUploadSizeMB: 10,
  FeePercent: 11 / 100,
  FeeFixed: 7_000,
  GalleryType: {
    InvitationMusic: 'invitation-music',
    InvitationMeta: 'invitation-meta',
    InvitationHero: 'invitation-hero',
    InvitationCarousel: 'invitation-carousel',
    InvitationMarqueeTop: 'invitation-slider-top',
    InvitationMarqueeBottom: 'invitation-slider-bottom',
  },
} as const

// export enum Bucket {
//   Internal = 'internal',
//   Invitation = process.env.NEXT_PUBLIC_BUCKET as unknown as 'U',
// }
export const Bucket = {
  Internal: 'internal',
  Invitation: process.env.NEXT_PUBLIC_BUCKET,
}
