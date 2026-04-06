import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        rfq: {
          include: {
            user: { select: { id: true, name: true, email: true, company: true } },
            items: { include: { cinema: true } },
            adCreatives: true,
          },
        },
        items: {
          include: {
            cinema: {
              include: { screens: true },
            },
          },
        },
        payment: true,
        campaign: true,
      },
    })

    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session.role === 'ADVERTISER' && quote.rfq.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: quote })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action } = body // 'accept' | 'reject' | 'update'

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { rfq: true },
    })

    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (action === 'accept') {
      if (session.role !== 'ADVERTISER' || quote.rfq.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const updated = await prisma.quote.update({
        where: { id: params.id },
        data: { status: 'ACCEPTED' },
      })

      await prisma.rFQ.update({
        where: { id: quote.rfqId },
        data: { status: 'ACCEPTED' },
      })

      // Create campaign shell
      const campaign = await prisma.campaign.create({
        data: {
          userId: quote.rfq.userId,
          quoteId: quote.id,
          name: quote.rfq.campaignName,
          status: 'PENDING',
          startDate: quote.rfq.durationStart,
          endDate: quote.rfq.durationEnd,
        },
      })

      await prisma.notification.create({
        data: {
          userId: session.userId,
          title: 'Quote Accepted',
          message: `You accepted the quote for "${quote.rfq.campaignName}". Please proceed to payment.`,
          type: 'SUCCESS',
        },
      })

      return NextResponse.json({ success: true, data: { quote: updated, campaign } })
    }

    if (action === 'reject') {
      if (session.role !== 'ADVERTISER' || quote.rfq.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const updated = await prisma.quote.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      })

      await prisma.rFQ.update({
        where: { id: quote.rfqId },
        data: { status: 'REJECTED' },
      })

      return NextResponse.json({ success: true, data: updated })
    }

    // Admin update
    if (session.role === 'ADMIN') {
      const { status, notes } = body
      const updated = await prisma.quote.update({
        where: { id: params.id },
        data: { status, notes },
      })
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Quote PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
