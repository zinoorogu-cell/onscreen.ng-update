import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cinema = await prisma.cinema.findUnique({
      where: { id: params.id },
      include: {
        screens: { include: { occupancyProfiles: true } },
        _count: { select: { screens: true, bookings: true } },
      },
    })
    
    if (!cinema) {
      return NextResponse.json({ error: 'Cinema not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: cinema })
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
    const { name, city, state, address, description, logoUrl, imageUrl, isActive, isApproved } = body
    
    const cinema = await prisma.cinema.update({
      where: { id: params.id },
      data: { name, city, state, address, description, logoUrl, imageUrl, isActive, isApproved },
    })
    
    return NextResponse.json({ success: true, data: cinema })
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
    
    await prisma.cinema.update({
      where: { id: params.id },
      data: { isActive: false },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
