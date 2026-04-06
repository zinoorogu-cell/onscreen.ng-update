'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2, Play, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { formatNumber, formatCurrency } from '@/lib/impressions'
import { AudienceDemographics } from '@/components/dashboard/AudienceDemographics'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/campaigns/${id}`).then(r => r.json()).then(d => {
      setCampaign(d.data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!campaign) return <div className="text-center text-gray-500 py-20">Campaign not found</div>

  const start = new Date(campaign.startDate)
  const end = new Date(campaign.endDate)
  const now = new Date()
  const total = end.getTime() - start.getTime()
  const elapsed = Math.min(Math.max(now.getTime() - start.getTime(), 0), total)
  const progress = total > 0 ? Math.round((elapsed / total) * 100) : 0
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  const impressionData = campaign.impressionLogs?.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
    impressions: log.impressions,
    plays: log.plays,
  })) || []

  const statusColors: Record<string, string> = {
    ACTIVE: 'badge-active', PENDING: 'badge-pending',
    COMPLETED: 'badge-completed', CANCELLED: 'badge-rejected',
  }

  const locations = [...new Set(campaign.bookings?.map((b: any) => b.cinema?.name) || [])]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/advertiser/campaigns" className="p-2 glass-card hover:border-cinema-muted">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-white">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={statusColors[campaign.status] || 'badge'}>{campaign.status}</span>
            <span className="text-gray-500 text-xs">{daysLeft} days remaining</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: formatNumber(campaign.totalImpressions || 0), icon: TrendingUp, color: 'text-brand-400' },
          { label: 'Total Plays', value: (campaign.totalPlays || 0).toLocaleString(), icon: Play, color: 'text-green-400' },
          { label: 'Locations', value: locations.length || campaign.quote?.items?.length || 0, icon: MapPin, color: 'text-yellow-400' },
          { label: 'Progress', value: `${progress}%`, icon: BarChart2, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="glass-card p-5">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-400">Campaign Progress</span>
          <span className="text-white font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-cinema-muted rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
            style={{ width: `${Math.max(2, progress)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span><Calendar className="w-3 h-3 inline mr-1" />{start.toLocaleDateString()}</span>
          <span>{end.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Charts */}
      {impressionData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 text-sm">Impressions Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={impressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => formatNumber(v)} />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, color: '#fff' }}
                  formatter={(v: any) => [formatNumber(v), 'Impressions']} />
                <Line type="monotone" dataKey="impressions" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 text-sm">Daily Plays</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={impressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, color: '#fff' }}
                  formatter={(v: any) => [v, 'Plays']} />
                <Bar dataKey="plays" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Locations */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Running Locations</h3>
          {(campaign.quote?.items || []).length === 0 && locations.length === 0 ? (
            <p className="text-gray-500 text-sm">No locations assigned yet</p>
          ) : (
            <div className="space-y-2">
              {(campaign.quote?.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-cinema-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    <div>
                      <div className="text-sm text-white">{item.cinema?.name}</div>
                      <div className="text-xs text-gray-500">{item.cinema?.city}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{formatNumber(item.estimatedImpressions || 0)} est. impressions</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quote summary */}
        {campaign.quote && (
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 text-sm">Investment Summary</h3>
            <div className="space-y-2">
              {[
                { label: 'Media Cost', value: formatCurrency(campaign.quote.totalMediaCost) },
                { label: 'Agency Fee', value: formatCurrency(campaign.quote.agencyFee) },
                { label: 'Conversion Fee', value: formatCurrency(campaign.quote.conversionFee) },
                { label: 'VAT', value: formatCurrency(campaign.quote.vatAmount) },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-white font-mono">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-cinema-border">
                <span className="text-white">Total</span>
                <span className="gold-text font-mono">{formatCurrency(campaign.quote.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AUDIENCE DEMOGRAPHICS & FILM FACTOR */}
      <div>
        <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Audience & Film Intelligence
        </h2>
        <AudienceDemographics campaignId={campaign.id} />
      </div>
    </div>
  )
}
