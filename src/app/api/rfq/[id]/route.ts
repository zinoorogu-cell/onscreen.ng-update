import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, company: true, phone: true } },
        items: {
          include: {
            cinema: {
              include: {
                screens: { include: { occupancyProfiles: true } },
              },
            },
          },
        },
        quote: {
          include: {
            items: { include: { cinema: true } },
            payment: true,
          },
        },
        adCreatives: true,
      },
    })

    if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 })

    // Ensure requester is owner or admin
    if (session.role === 'ADVERTISER' && rfq.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: rfq })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { status } = body

    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } })
    if (!rfq) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session.role === 'ADVERTISER' && rfq.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.rFQ.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
