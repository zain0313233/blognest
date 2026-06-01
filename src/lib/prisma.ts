import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter, log: ['error'] })
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma
  // Dev hot-reload can keep an old client before new models are generated
  const hasNewsletterDelegate =
    !cached ||
    Boolean(
      (cached as unknown as { newsletterSubscriber?: unknown }).newsletterSubscriber
    )
  if (cached && !hasNewsletterDelegate) {
    void cached.$disconnect().catch(() => {})
    globalForPrisma.prisma = undefined
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

export const prisma = getPrismaClient()
