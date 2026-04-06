import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { quoteId, reference } = await req.json()

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { rfq: true },
    })

    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        quoteId,
        amount: quote.grandTotal,
        reference,
        status: 'PAID',
        paidAt: new Date(),
      },
    })

    // Update campaign to active
    if (quote.rfq) {
      const campaign = await prisma.campaign.findFirst({ where: { quoteId } })
      if (campaign) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'ACTIVE' },
        })
      }
    }

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
