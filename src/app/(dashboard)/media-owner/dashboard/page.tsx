'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Film, Users, TrendingUp, Plus, ChevronRight } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/impressions'

export default function MediaOwnerDashboard() {
  const [cinemas, setCinemas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cinemas').then(r => r.json()).then(d => {
      setCinemas(d.data || [])
      setLoading(false)
    })
  }, [])

  const totalScreens = cinemas.reduce((s, c) => s + (c.screens?.length || 0), 0)
  const totalSeats = cinemas.reduce((s, c) =>
    s + (c.screens || []).reduce((ss: number, sc: any) => ss + sc.seatingCapacity, 0), 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Media Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your cinema inventory</p>
        </div>
        <Link href="/media-owner/inventory" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Inventory
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Cinemas', value: cinemas.length, icon: Building2, color: 'text-blue-400' },
          { label: 'Total Screens', value: totalScreens, icon: Film, color: 'text-brand-400' },
          { label: 'Total Seats', value: totalSeats.toLocaleString(), icon: Users, color: 'text-green-400' },
          { label: 'Est. Daily Reach', value: formatNumber(totalSeats * 3 * 0.5), icon: TrendingUp, color: 'text-gold' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cinema-border">
          <h2 className="font-semibold text-white">My Cinemas</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : cinemas.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No cinemas registered yet</p>
            <Link href="/media-owner/inventory" className="btn-primary mt-4 text-sm py-2">Register a Cinema</Link>
          </div>
        ) : (
          <div className="divide-y divide-cinema-border">
            {cinemas.map(cinema => (
              <div key={cinema.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
                    <Film className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{cinema.name}</div>
                    <div className="text-xs text-gray-500">{cinema.city} · {cinema.screens?.length || 0} screens</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cinema.isApproved ? 'badge-active' : 'badge-pending'}>
                    {cinema.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
