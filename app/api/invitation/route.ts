import { prisma } from '@app/server/db'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const hash = searchParams.get('hash')

  if (!hash) {
    return NextResponse.json(
      { data: null },
      { status: 500, statusText: 'Invalid identifier' }
    )
  }

  const wid = hash.split('-')[hash.split('-').length - 1]
  const invitation = await prisma.invitation.findUnique({ where: { wid } })

  if (!invitation) {
    return NextResponse.json(
      { data: null },
      { status: 500, statusText: 'Invitation not found' }
    )
  }

  return NextResponse.json({ data: invitation })
}
