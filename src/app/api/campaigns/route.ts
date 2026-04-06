import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const where: Record<string, unknown> = {}
    if (session.role === 'ADVERTISER') where.userId = session.userId

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, company: true } },
        quote: {
          include: {
            items: { include: { cinema: true } },
          },
        },
        bookings: {
          include: {
            cinema: { select: { id: true, name: true, city: true } },
            screen: true,
          },
        },
        adCreatives: true,
        impressionLogs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: campaigns })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { quoteId, name, startDate, endDate, userId } = body

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        quoteId,
        name,
        status: 'ACTIVE',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    })

    return NextResponse.json({ success: true, data: campaign })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
