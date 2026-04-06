import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, company: true } },
        quote: {
          include: {
            items: { include: { cinema: true } },
            rfq: true,
          },
        },
        bookings: {
          include: {
            cinema: true,
            screen: true,
          },
        },
        adCreatives: true,
        impressionLogs: {
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session.role === 'ADVERTISER' && campaign.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: campaign })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { status, totalImpressions, totalPlays } = body

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: { status, totalImpressions, totalPlays },
    })

    return NextResponse.json({ success: true, data: campaign })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
