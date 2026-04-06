import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { date, impressions, plays, location } = await req.json()

    const log = await prisma.impressionLog.create({
      data: {
        campaignId: params.id,
        date: new Date(date),
        impressions,
        plays: plays || 0,
        location: location || 'Lagos',
      },
    })

    // Update campaign totals
    const allLogs = await prisma.impressionLog.findMany({ where: { campaignId: params.id } })
    const totalImpressions = allLogs.reduce((s, l) => s + l.impressions, 0)
    const totalPlays = allLogs.reduce((s, l) => s + l.plays, 0)

    await prisma.campaign.update({
      where: { id: params.id },
      data: { totalImpressions, totalPlays },
    })

    return NextResponse.json({ success: true, data: log })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
