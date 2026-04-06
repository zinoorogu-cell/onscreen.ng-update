import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCampaignImpressions } from '@/lib/impressions'
import { TimeOfDay } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { screenId, timeSlots, startDate, endDate, slotsPerDay } = body

    if (!screenId || !startDate || !endDate) {
      return NextResponse.json({ error: 'screenId, startDate, endDate required' }, { status: 400 })
    }

    const screen = await prisma.screen.findUnique({
      where: { id: screenId },
      include: { occupancyProfiles: true },
    })

    if (!screen) return NextResponse.json({ error: 'Screen not found' }, { status: 404 })

    const slots = (timeSlots || ['ALL_DAY']) as TimeOfDay[]

    const result = calculateCampaignImpressions(
      screen.seatingCapacity,
      screen.showtimesPerDay,
      screen.occupancyProfiles,
      slots,
      new Date(startDate),
      new Date(endDate),
      slotsPerDay || 1
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
