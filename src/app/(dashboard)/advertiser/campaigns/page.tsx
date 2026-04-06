'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart2, TrendingUp, Play, MapPin, Calendar, ChevronRight } from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/impressions'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(d => {
      setCampaigns(d.data || [])
      setLoading(false)
    })
  }, [])

  const statusBadge = (s: string) => ({ ACTIVE: 'badge-active', PENDING: 'badge-pending', COMPLETED: 'badge-completed', CANCELLED: 'badge-rejected' }[s] || 'badge')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Campaigns</h1>
        <p className="text-gray-500 text-sm mt-1">Track all your active and past campaigns</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No campaigns yet</h3>
          <p className="text-gray-500 text-sm mb-4">Submit an RFQ to get your first campaign running</p>
          <Link href="/advertiser/rfq/new" className="btn-primary">Submit RFQ</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => {
            const start = new Date(c.startDate)
            const end = new Date(c.endDate)
            const now = new Date()
            const progress = Math.min(100, Math.max(0, Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)))

            return (
              <Link key={c.id} href={`/advertiser/campaigns/${c.id}`} className="glass-card p-5 block card-hover">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {start.toLocaleDateString()} → {end.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={statusBadge(c.status)}>{c.status}</span>
                    {c.quote?.grandTotal && <span className="text-xs text-gray-500 font-mono">{formatCurrency(c.quote.grandTotal)}</span>}
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  {[
                    { icon: TrendingUp, label: 'Impressions', value: formatNumber(c.totalImpressions || 0) },
                    { icon: Play, label: 'Plays', value: (c.totalPlays || 0).toLocaleString() },
                    { icon: MapPin, label: 'Locations', value: c.quote?.items?.length || 0 },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className="text-sm font-semibold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="w-full bg-cinema-muted rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    style={{ width: `${Math.max(2, progress)}%` }} />
                </div>
                <div className="text-xs text-gray-600 mt-1">{progress}% complete</div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
