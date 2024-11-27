import { redirect } from 'next/navigation'
import { Routes } from '@/core/config'

export default async function Home() {
  redirect(Routes.invitationKoleksi)
}
