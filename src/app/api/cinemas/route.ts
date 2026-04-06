import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const city = searchParams.get('city')
    const isApproved = searchParams.get('approved')
    
    const where: Record<string, unknown> = {}
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (isApproved !== null) where.isApproved = isApproved === 'true'
    else where.isApproved = true
    where.isActive = true
    
    const cinemas = await prisma.cinema.findMany({
      where,
      include: {
        screens: {
          include: { occupancyProfiles: true },
        },
        _count: { select: { screens: true } },
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json({ success: true, data: cinemas })
  } catch (error) {
    console.error('Get cinemas error:', error)
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
    const { name, city, state, address, description, logoUrl, imageUrl, screenConfig } = body
    
    if (!name || !city || !state || !address) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }
    
    const cinema = await prisma.cinema.create({
      data: {
        name, city, state, address, description, logoUrl, imageUrl,
        isApproved: true,
        isActive: true,
      },
    })
    
    // Create screens if provided
    if (screenConfig && Array.isArray(screenConfig)) {
      for (const screen of screenConfig) {
        const createdScreen = await prisma.screen.create({
          data: {
            cinemaId: cinema.id,
            name: screen.name,
            seatingCapacity: screen.seatingCapacity,
            showtimesPerDay: screen.showtimesPerDay,
            basePrice: screen.basePrice,
          },
        })
        
        // Create default occupancy profiles
        const defaultProfiles = [
          { timeOfDay: 'MORNING', dayType: 'WEEKDAY', occupancyRate: 0.20 },
          { timeOfDay: 'AFTERNOON', dayType: 'WEEKDAY', occupancyRate: 0.35 },
          { timeOfDay: 'EVENING', dayType: 'WEEKDAY', occupancyRate: 0.65 },
          { timeOfDay: 'ALL_DAY', dayType: 'WEEKDAY', occupancyRate: 0.40 },
          { timeOfDay: 'MORNING', dayType: 'WEEKEND', occupancyRate: 0.40 },
          { timeOfDay: 'AFTERNOON', dayType: 'WEEKEND', occupancyRate: 0.70 },
          { timeOfDay: 'EVENING', dayType: 'WEEKEND', occupancyRate: 0.90 },
          { timeOfDay: 'ALL_DAY', dayType: 'WEEKEND', occupancyRate: 0.67 },
          { timeOfDay: 'MORNING', dayType: 'HOLIDAY', occupancyRate: 0.55 },
          { timeOfDay: 'AFTERNOON', dayType: 'HOLIDAY', occupancyRate: 0.85 },
          { timeOfDay: 'EVENING', dayType: 'HOLIDAY', occupancyRate: 0.95 },
          { timeOfDay: 'ALL_DAY', dayType: 'HOLIDAY', occupancyRate: 0.78 },
          { timeOfDay: 'MORNING', dayType: 'FESTIVE', occupancyRate: 0.70 },
          { timeOfDay: 'AFTERNOON', dayType: 'FESTIVE', occupancyRate: 0.95 },
          { timeOfDay: 'EVENING', dayType: 'FESTIVE', occupancyRate: 0.99 },
          { timeOfDay: 'ALL_DAY', dayType: 'FESTIVE', occupancyRate: 0.88 },
        ]
        
        for (const profile of defaultProfiles) {
          await prisma.occupancyProfile.create({
            data: {
              screenId: createdScreen.id,
              timeOfDay: profile.timeOfDay as any,
              dayType: profile.dayType as any,
              occupancyRate: profile.occupancyRate,
            },
          })
        }
      }
    }
    
    const result = await prisma.cinema.findUnique({
      where: { id: cinema.id },
      include: { screens: { include: { occupancyProfiles: true } } },
    })
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Create cinema error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
