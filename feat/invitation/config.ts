export const InvitationConfig = {
  Starter: {
    Price: 0,
    MaxGuest: 25,
    MaxPhoto: 0,
    UploadMaxSize: 10,
    UploadMusic: 0,
    ExpireAt: 0,
  },
  Premium: {
    Price: 99_000,
    MaxGuest: 300,
    MaxPhoto: 20,
    UploadMaxSize: 10,
    UploadMusic: 1,
    ExpireAt: 3,
  },
  Pro: {
    Price: 199_000,
    MaxGuest: 1000,
    MaxPhoto: 32,
    UploadMaxSize: 25,
    UploadMusic: 1,
    ExpireAt: 6,
  },
} as const

export enum InvitationTypeEnum {
  pernikahan = 'pernikahan',
  'ulang-tahun' = 'ulang-tahun',
  reuni = 'reuni',
  rapat = 'rapat',
  khitanan = 'khitanan',
  tasyakuran = 'tasyakuran',
}

export enum InvitationTierEnum {
  Starter = 'Starter',
  Premium = 'Premium',
  Pro = 'Pro',
}
