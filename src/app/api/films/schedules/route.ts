import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// GET /api/films/schedules?cinemaId=xxx&weekStart=2025-03-17
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const cinemaId = searchParams.get('cinemaId')
    const weekStart = searchParams.get('weekStart')
    const filmId = searchParams.get('filmId')

    const where: Record<string, unknown> = { isActive: true }
    if (cinemaId) where.cinemaId = cinemaId
    if (filmId) where.filmId = filmId
    if (weekStart) {
      const start = new Date(weekStart)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      where.weekStartDate = { gte: start, lte: end }
    }

    const schedules = await prisma.filmSchedule.findMany({
      where,
      include: {
        film: {
          select: {
            id: true, title: true, category: true, status: true,
            posterUrl: true, genre: true, rating: true,
            audienceGender: true, audienceAge: true,
          },
        },
        cinema: { select: { id: true, name: true, city: true } },
        screen: { select: { id: true, name: true, seatingCapacity: true } },
      },
      orderBy: { weekStartDate: 'asc' },
    })

    return NextResponse.json({ success: true, data: schedules })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/films/schedules - assign film to screen for a week
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { filmId, screenId, cinemaId, weekStartDate, showtimesPerDay, timeSlots } = body

    if (!filmId || !screenId || !cinemaId || !weekStartDate) {
      return NextResponse.json({ error: 'filmId, screenId, cinemaId, weekStartDate required' }, { status: 400 })
    }

    const start = new Date(weekStartDate)
    // Normalize to Monday
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    const schedule = await prisma.filmSchedule.upsert({
      where: {
        filmId_screenId_weekStartDate: {
          filmId,
          screenId,
          weekStartDate: start,
        },
      },
      update: {
        showtimesPerDay: showtimesPerDay || 5,
        timeSlots: timeSlots || ['MORNING', 'AFTERNOON', 'EVENING'],
        isActive: true,
      },
      create: {
        filmId,
        screenId,
        cinemaId,
        weekStartDate: start,
        weekEndDate: end,
        showtimesPerDay: showtimesPerDay || 5,
        timeSlots: timeSlots || ['MORNING', 'AFTERNOON', 'EVENING'],
        isActive: true,
      },
      include: {
        film: true,
        cinema: { select: { name: true, city: true } },
        screen: { select: { name: true } },
      },
    })

    return NextResponse.json({ success: true, data: schedule })
  } catch (error) {
    console.error('Create schedule error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/films/schedules?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.filmSchedule.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
