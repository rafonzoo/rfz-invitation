import { PrismaClient } from '@prisma/client'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = new PrismaClient()
  }

  return globalThis.prismaGlobal as InstanceType<typeof PrismaClient>
}

export const prisma = prismaClientSingleton()
