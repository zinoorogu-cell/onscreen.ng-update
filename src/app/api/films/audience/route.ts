import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const filmId = searchParams.get('filmId')
    const cinemaId = searchParams.get('cinemaId')
    const campaignId = searchParams.get('campaignId')

    const where: Record<string, unknown> = {}
    if (filmId) where.filmId = filmId
    if (cinemaId) where.cinemaId = cinemaId
    if (campaignId) where.campaignId = campaignId

    const logs = await prisma.filmAudienceLog.findMany({
      where,
      include: {
        film: { select: { id: true, title: true, category: true, posterUrl: true } },
        cinema: { select: { id: true, name: true, city: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    })

    // Aggregate stats
    const totals = logs.reduce((acc, log) => ({
      totalAttendance: acc.totalAttendance + log.attendance,
      avgMale: acc.avgMale + log.malePercent,
      avgFemale: acc.avgFemale + log.femalePercent,
      avgUnder18: acc.avgUnder18 + log.under18Percent,
      avg18to35: acc.avg18to35 + log.age18to35,
      avg36to50: acc.avg36to50 + log.age36to50,
      avg50plus: acc.avg50plus + log.age50plusPercent,
    }), {
      totalAttendance: 0, avgMale: 0, avgFemale: 0,
      avgUnder18: 0, avg18to35: 0, avg36to50: 0, avg50plus: 0,
    })

    const count = logs.length || 1
    const aggregated = {
      totalAttendance: totals.totalAttendance,
      malePercent: Math.round(totals.avgMale / count),
      femalePercent: Math.round(totals.avgFemale / count),
      under18Percent: Math.round(totals.avgUnder18 / count),
      age18to35: Math.round(totals.avg18to35 / count),
      age36to50: Math.round(totals.avg36to50 / count),
      age50plusPercent: Math.round(totals.avg50plus / count),
    }

    return NextResponse.json({ success: true, data: { logs, aggregated } })
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
    const {
      filmId, cinemaId, campaignId, date, attendance,
      malePercent, femalePercent, under18Percent,
      age18to35, age36to50, age50plusPercent,
    } = body

    const log = await prisma.filmAudienceLog.create({
      data: {
        filmId,
        cinemaId,
        campaignId,
        date: new Date(date),
        attendance: parseInt(attendance) || 0,
        malePercent: parseFloat(malePercent) || 50,
        femalePercent: parseFloat(femalePercent) || 50,
        under18Percent: parseFloat(under18Percent) || 0,
        age18to35: parseFloat(age18to35) || 60,
        age36to50: parseFloat(age36to50) || 30,
        age50plusPercent: parseFloat(age50plusPercent) || 10,
      },
    })

    return NextResponse.json({ success: true, data: log })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
