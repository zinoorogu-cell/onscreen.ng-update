import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const status = searchParams.get('status')      // NOW_SHOWING | COMING_SOON | ENDED | ALL
    const category = searchParams.get('category')  // NOLLYWOOD | HOLLYWOOD | etc
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = {}
    if (status && status !== 'ALL') where.status = status
    if (category && category !== 'ALL') where.category = category
    if (featured === 'true') where.isFeatured = true

    const films = await prisma.film.findMany({
      where,
      include: {
        schedules: {
          where: { isActive: true },
          include: {
            cinema: { select: { id: true, name: true, city: true } },
            screen: { select: { id: true, name: true, seatingCapacity: true } },
          },
          orderBy: { weekStartDate: 'asc' },
        },
        _count: { select: { schedules: true, audienceLogs: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data: films })
  } catch (error) {
    console.error('Get films error:', error)
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
      title, category, status, posterUrl, trailerUrl, synopsis,
      director, cast, genre, rating, durationMins,
      audienceGender, audienceAge, releaseDate, endDate,
      isFeatured, sortOrder,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const film = await prisma.film.create({
      data: {
        title,
        category: category || 'NOLLYWOOD',
        status: status || 'NOW_SHOWING',
        posterUrl,
        trailerUrl,
        synopsis,
        director,
        cast,
        genre,
        rating,
        durationMins: durationMins ? parseInt(durationMins) : null,
        audienceGender: audienceGender || 'MIXED',
        audienceAge: audienceAge || 'MIXED',
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isFeatured: isFeatured || false,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ success: true, data: film })
  } catch (error) {
    console.error('Create film error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
