'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart2, FileText, Building2, TrendingUp, ArrowRight, DollarSign, Users, Clock } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/impressions'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => {
      setData(d.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const statusBadge = (s: string) => ({ PENDING: 'badge-pending', QUOTED: 'badge-quoted', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected', ACTIVE: 'badge-active' }[s] || 'badge')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Partner Cinemas', value: data?.stats?.totalCinemas || 0, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', href: '/admin/cinemas' },
    { label: 'Total RFQs', value: data?.stats?.totalRFQs || 0, icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', href: '/admin/rfq' },
    { label: 'Active Campaigns', value: data?.stats?.activeCampaigns || 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', href: '/admin/campaigns' },
    { label: 'Total Revenue', value: formatCurrency(data?.stats?.totalRevenue || 0), icon: DollarSign, color: 'text-gold', bg: 'bg-yellow-500/5 border-yellow-500/20', href: '/admin/quotes' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
        </div>
        {(data?.stats?.pendingRFQs || 0) > 0 && (
          <div className="glass-card px-4 py-2 flex items-center gap-2 border-yellow-500/30">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">{data?.stats?.pendingRFQs} pending RFQ{data.stats.pendingRFQs > 1 ? 's' : ''}</span>
            <Link href="/admin/rfq" className="text-xs text-yellow-600 hover:text-yellow-400">Review →</Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={`stat-card border ${stat.bg} card-hover`}>
            <div className={`w-10 h-10 rounded-lg ${stat.bg} border flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent RFQs */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-cinema-border">
            <h2 className="font-semibold text-white">Recent RFQ Requests</h2>
            <Link href="/admin/rfq" className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-cinema-border">
            {(data?.recentRFQs || []).map((rfq: any) => (
              <Link key={rfq.id} href={`/admin/rfq/${rfq.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-cinema-card/50 transition-colors group">
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">
                    {rfq.campaignName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {rfq.user?.company || rfq.user?.name} · {rfq.items?.length || 0} cinema{rfq.items?.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={statusBadge(rfq.status)}>{rfq.status}</span>
                  {rfq.quote?.grandTotal && (
                    <span className="text-xs font-mono text-gray-500">{formatCurrency(rfq.quote.grandTotal)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {(!data?.recentRFQs?.length) && (
            <div className="p-8 text-center text-gray-500 text-sm">No RFQs yet</div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-cinema-border">
            <h2 className="font-semibold text-white">Recent Campaigns</h2>
            <Link href="/admin/campaigns" className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-cinema-border">
            {(data?.recentCampaigns || []).map((campaign: any) => (
              <Link key={campaign.id} href={`/admin/campaigns/${campaign.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-cinema-card/50 transition-colors group">
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">
                    {campaign.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{campaign.user?.company || campaign.user?.name}</div>
                </div>
                <span className={statusBadge(campaign.status)}>{campaign.status}</span>
              </Link>
            ))}
          </div>
          {(!data?.recentCampaigns?.length) && (
            <div className="p-8 text-center text-gray-500 text-sm">No campaigns yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
