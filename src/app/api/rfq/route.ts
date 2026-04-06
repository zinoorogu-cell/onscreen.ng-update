import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const where: Record<string, unknown> = {}
    
    if (session.role === 'ADVERTISER') {
      where.userId = session.userId
    }
    // ADMIN and MEDIA_OWNER see all (with their cinemas for media owner)
    
    const rfqs = await prisma.rFQ.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, company: true } },
        items: {
          include: {
            cinema: { select: { id: true, name: true, city: true, state: true } },
          },
        },
        quote: {
          select: {
            id: true, status: true, grandTotal: true, totalMediaCost: true,
            agencyFee: true, vatAmount: true, conversionFee: true,
          },
        },
        adCreatives: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({ success: true, data: rfqs })
  } catch (error) {
    console.error('Get RFQs error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADVERTISER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const {
      campaignName, brandName, contactEmail, phone,
      durationStart, durationEnd, targetCities, notes,
      items, adCreativeUrl, adCreativeLink,
    } = body
    
    if (!campaignName || !brandName || !durationStart || !durationEnd || !items?.length) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }
    
    const rfq = await prisma.rFQ.create({
      data: {
        userId: session.userId,
        campaignName,
        brandName,
        contactEmail: contactEmail || session.email,
        phone: phone || '',
        durationStart: new Date(durationStart),
        durationEnd: new Date(durationEnd),
        targetCities: targetCities || [],
        notes,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            cinemaId: item.cinemaId,
            slotsRequested: item.slotsRequested || 1,
            preferredTime: item.preferredTime || ['EVENING'],
            notes: item.notes,
          })),
        },
      },
      include: {
        items: { include: { cinema: true } },
        adCreatives: true,
      },
    })
    
    // Create ad creative record if provided
    if (adCreativeUrl || adCreativeLink) {
      await prisma.adCreative.create({
        data: {
          rfqId: rfq.id,
          fileUrl: adCreativeUrl,
          externalLink: adCreativeLink,
        },
      })
    }
    
    // Notify admin
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'RFQ Submitted',
        message: `Your RFQ for "${campaignName}" has been submitted. Admin will review and send a quote.`,
        type: 'SUCCESS',
      },
    })
    
    return NextResponse.json({ success: true, data: rfq })
  } catch (error) {
    console.error('Create RFQ error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
