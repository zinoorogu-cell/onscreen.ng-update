'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart2, FileText, TrendingUp, Clock, ArrowRight, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/impressions'

export default function AdvertiserDashboard() {
  const [rfqs, setRfqs] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/rfq').then(r => r.json()),
      fetch('/api/campaigns').then(r => r.json()),
    ]).then(([rfqData, campData]) => {
      setRfqs(rfqData.data || [])
      setCampaigns(campData.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const pendingRFQs = rfqs.filter(r => r.status === 'PENDING').length
  const quotedRFQs = rfqs.filter(r => r.status === 'QUOTED').length
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
  const totalImpressions = campaigns.reduce((s: number, c: any) => s + (c.totalImpressions || 0), 0)

  const stats = [
    { label: 'Total RFQs', value: rfqs.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Awaiting Quote', value: quotedRFQs, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Active Campaigns', value: activeCampaigns, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Total Impressions', value: formatNumber(totalImpressions), icon: BarChart2, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
  ]

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', QUOTED: 'badge-quoted', ACCEPTED: 'badge-accepted',
      REJECTED: 'badge-rejected', ACTIVE: 'badge-active', COMPLETED: 'badge-completed',
    }
    return map[status] || 'badge'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your advertising campaigns</p>
        </div>
        <Link href="/advertiser/rfq/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New RFQ
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card border ${stat.bg}`}>
            <div className={`w-10 h-10 rounded-lg ${stat.bg} border flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Notifications panel for pending quotes */}
      {quotedRFQs > 0 && (
        <div className="glass-card border-l-4 border-l-yellow-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <div className="text-white font-medium text-sm">You have {quotedRFQs} quote{quotedRFQs > 1 ? 's' : ''} ready to review</div>
              <div className="text-gray-500 text-xs">Accept or reject to proceed with your campaign</div>
            </div>
          </div>
          <Link href="/advertiser/rfq" className="btn-outline text-xs py-1.5 px-3">View Quotes</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent RFQs */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-cinema-border">
            <h2 className="font-semibold text-white">Recent Requests</h2>
            <Link href="/advertiser/rfq" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {rfqs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No requests yet</p>
              <Link href="/advertiser/rfq/new" className="btn-primary mt-4 text-sm py-2">Submit Your First RFQ</Link>
            </div>
          ) : (
            <div className="divide-y divide-cinema-border">
              {rfqs.slice(0, 5).map((rfq) => (
                <Link key={rfq.id} href={`/advertiser/rfq/${rfq.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-cinema-card/50 transition-colors group">
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">
                      {rfq.campaignName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {rfq.items?.length || 0} cinema{rfq.items?.length !== 1 ? 's' : ''} · {new Date(rfq.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={statusBadge(rfq.status)}>{rfq.status}</span>
                    {rfq.quote?.grandTotal && (
                      <span className="text-xs text-gray-500">{formatCurrency(rfq.quote.grandTotal)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-cinema-border">
            <h2 className="font-semibold text-white">Active Campaigns</h2>
            <Link href="/advertiser/campaigns" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No campaigns yet</p>
              <p className="text-gray-600 text-xs mt-1">Submit an RFQ to start your campaign</p>
            </div>
          ) : (
            <div className="divide-y divide-cinema-border">
              {campaigns.slice(0, 5).map((campaign) => {
                const start = new Date(campaign.startDate)
                const end = new Date(campaign.endDate)
                const now = new Date()
                const total = end.getTime() - start.getTime()
                const elapsed = Math.min(now.getTime() - start.getTime(), total)
                const progress = total > 0 ? Math.round((elapsed / total) * 100) : 0

                return (
                  <Link key={campaign.id} href={`/advertiser/campaigns/${campaign.id}`}
                    className="block px-5 py-3.5 hover:bg-cinema-card/50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors truncate flex-1 mr-4">
                        {campaign.name}
                      </div>
                      <span className={statusBadge(campaign.status)}>{campaign.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>{formatNumber(campaign.totalImpressions || 0)} impressions</span>
                      <span>·</span>
                      <span>{campaign.totalPlays || 0} plays</span>
                    </div>
                    <div className="w-full bg-cinema-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
                        style={{ width: `${Math.max(2, progress)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{progress}% complete</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
