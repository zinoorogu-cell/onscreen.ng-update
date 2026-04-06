import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const film = await prisma.film.findUnique({
      where: { id: params.id },
      include: {
        schedules: {
          where: { isActive: true },
          include: {
            cinema: { select: { id: true, name: true, city: true, state: true } },
            screen: { select: { id: true, name: true, seatingCapacity: true, showtimesPerDay: true } },
          },
          orderBy: { weekStartDate: 'asc' },
        },
        audienceLogs: {
          orderBy: { date: 'desc' },
          take: 30,
          include: {
            cinema: { select: { name: true, city: true } },
          },
        },
        _count: { select: { schedules: true, audienceLogs: true } },
      },
    })

    if (!film) return NextResponse.json({ error: 'Film not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: film })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const film = await prisma.film.update({
      where: { id: params.id },
      data: {
        title,
        category,
        status,
        posterUrl,
        trailerUrl,
        synopsis,
        director,
        cast,
        genre,
        rating,
        durationMins: durationMins ? parseInt(durationMins) : undefined,
        audienceGender,
        audienceAge,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isFeatured,
        sortOrder,
      },
    })

    return NextResponse.json({ success: true, data: film })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.film.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
