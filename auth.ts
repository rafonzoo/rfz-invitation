import { prisma } from '@app/server/db'
import NextAuth from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: '/akun/masuk' },
  providers: [Google, Github],
  callbacks: {
    signIn: async (params) => {
      if (!params.user.email) {
        return false
      }

      const email = params.user.email
      await prisma.user.upsert({
        where: { email },
        update: { image: params.user.image },
        create: {
          email,
          name: params.user.name,
          image: params.user.image,
        },
      })

      return true
    },
  },
})
