import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { calculateQuoteTotal } from '@/lib/impressions'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const where: Record<string, unknown> = {}
    if (session.role === 'ADVERTISER') {
      where.rfq = { userId: session.userId }
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        rfq: {
          include: {
            user: { select: { id: true, name: true, email: true, company: true } },
            items: { include: { cinema: true } },
          },
        },
        items: { include: { cinema: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: quotes })
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
    const { rfqId, items, notes, validUntil } = body

    if (!rfqId || !items?.length) {
      return NextResponse.json({ error: 'rfqId and items required' }, { status: 400 })
    }

    const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId }, include: { user: true } })
    if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 })

    // Calculate totals
    const totalMediaCost = items.reduce((sum: number, item: any) => sum + item.pricePerSlot * item.slots, 0)
    const { agencyFee, vatAmount, conversionFee, grandTotal } = calculateQuoteTotal(totalMediaCost)

    // Delete existing quote if any
    const existingQuote = await prisma.quote.findUnique({ where: { rfqId } })
    if (existingQuote) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: existingQuote.id } })
      await prisma.quote.delete({ where: { id: existingQuote.id } })
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        totalMediaCost,
        agencyFee,
        vatAmount,
        conversionFee,
        grandTotal,
        notes,
        status: 'SENT',
        validUntil: validUntil ? new Date(validUntil) : undefined,
        items: {
          create: items.map((item: any) => ({
            cinemaId: item.cinemaId,
            slots: item.slots,
            pricePerSlot: item.pricePerSlot,
            subtotal: item.pricePerSlot * item.slots,
            timeOfDay: item.timeOfDay || 'ALL_DAY',
            estimatedImpressions: item.estimatedImpressions || 0,
          })),
        },
      },
      include: {
        items: { include: { cinema: true } },
        rfq: { include: { user: true } },
      },
    })

    // Update RFQ status
    await prisma.rFQ.update({ where: { id: rfqId }, data: { status: 'QUOTED' } })

    // Notify advertiser
    await prisma.notification.create({
      data: {
        userId: rfq.userId,
        title: 'Quote Ready',
        message: `Your quote for "${rfq.campaignName}" is ready. Total: ₦${grandTotal.toLocaleString()}`,
        type: 'INFO',
      },
    })

    return NextResponse.json({ success: true, data: quote })
  } catch (error) {
    console.error('Create quote error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
