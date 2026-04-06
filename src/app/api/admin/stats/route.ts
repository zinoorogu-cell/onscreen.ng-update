import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [
      totalCinemas,
      totalRFQs,
      pendingRFQs,
      activeCampaigns,
      totalRevenue,
      recentRFQs,
      recentCampaigns,
    ] = await Promise.all([
      prisma.cinema.count({ where: { isActive: true } }),
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'PENDING' } }),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.rFQ.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, company: true } },
          items: { include: { cinema: { select: { name: true, city: true } } } },
          quote: { select: { grandTotal: true, status: true } },
        },
      }),
      prisma.campaign.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, company: true } },
        },
      }),
    ])

    const monthlyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'PAID',
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      _sum: { amount: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalCinemas,
          totalRFQs,
          pendingRFQs,
          activeCampaigns,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        recentRFQs,
        recentCampaigns,
        monthlyRevenue,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
