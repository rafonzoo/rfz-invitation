import NextAuth from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { prisma } from '@/core/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Github],
  session: {
    maxAge: 60 * 60 * 24, // 1 day
    updateAge: 5 * 60, // 5 minutes
  },
  theme: {
    logo: '/assets/img/rfz-logo.png',
  },
  callbacks: {
    signIn: async (params) => {
      const email = params.user.email

      if (!email) {
        return false
      }

      await prisma.user.upsert({
        where: { email },
        update: { image: params.user.image },
        create: {
          email,
          userName: email.split('@')[0],
          name: params.user.name,
          image: params.user.image,
        },
      })

      return true
    },
  },
})
