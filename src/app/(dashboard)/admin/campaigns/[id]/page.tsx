'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Play, MapPin, Calendar, Loader2, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatNumber, formatCurrency } from '@/lib/impressions'
import { AudienceDemographics } from '@/components/dashboard/AudienceDemographics'

export default function AdminCampaignDetailPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // For adding impression logs manually
  const [logForm, setLogForm] = useState({ date: '', impressions: '', plays: '', location: '' })
  const [addingLog, setAddingLog] = useState(false)

  useEffect(() => {
    fetch(`/api/campaigns/${id}`).then(r => r.json()).then(d => {
      setCampaign(d.data)
      setLoading(false)
    })
  }, [id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const res = await fetch(`/api/campaigns/${id}`)
    const data = await res.json()
    setCampaign(data.data)
    setUpdating(false)
  }

  const addImpressionLog = async () => {
    if (!logForm.date || !logForm.impressions) return
    setAddingLog(true)
    await fetch(`/api/campaigns/${id}/impressions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: logForm.date,
        impressions: parseInt(logForm.impressions),
        plays: parseInt(logForm.plays) || 0,
        location: logForm.location || 'Lagos',
      }),
    })
    // Refresh
    const res = await fetch(`/api/campaigns/${id}`)
    const data = await res.json()
    setCampaign(data.data)
    setLogForm({ date: '', impressions: '', plays: '', location: '' })
    setAddingLog(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!campaign) return <div className="text-center text-gray-500 py-20">Campaign not found</div>

  const impressionData = campaign.impressionLogs?.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
    impressions: log.impressions,
    plays: log.plays,
  })) || []

  const statusBadge = (s: string) => ({ ACTIVE: 'badge-active', PENDING: 'badge-pending', COMPLETED: 'badge-completed' }[s] || 'badge')

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/campaigns" className="p-2 glass-card hover:border-cinema-muted"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-white">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={statusBadge(campaign.status)}>{campaign.status}</span>
            <span className="text-gray-500 text-xs">{campaign.user?.company || campaign.user?.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'PENDING' && (
            <button onClick={() => updateStatus('ACTIVE')} disabled={updating}
              className="btn-primary py-2 text-sm">
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Activate'}
            </button>
          )}
          {campaign.status === 'ACTIVE' && (
            <button onClick={() => updateStatus('COMPLETED')} disabled={updating}
              className="btn-outline py-2 text-sm">
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: formatNumber(campaign.totalImpressions || 0), icon: TrendingUp, color: 'text-brand-400' },
          { label: 'Total Plays', value: (campaign.totalPlays || 0).toLocaleString(), icon: Play, color: 'text-green-400' },
          { label: 'Locations', value: campaign.quote?.items?.length || 0, icon: MapPin, color: 'text-yellow-400' },
          { label: 'Investment', value: campaign.quote ? formatCurrency(campaign.quote.grandTotal) : '—', icon: Calendar, color: 'text-gold' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="text-xl font-display font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Impression chart */}
      {impressionData.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Impressions Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={impressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, color: '#fff' }} formatter={(v: any) => [formatNumber(v), 'Impressions']} />
              <Line type="monotone" dataKey="impressions" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add impression log */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4 text-sm">Log Impressions</h3>
        <div className="grid sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Date</label>
            <input type="date" className="input-field py-2 text-sm" value={logForm.date}
              onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Impressions</label>
            <input type="number" className="input-field py-2 text-sm" placeholder="15000"
              value={logForm.impressions} onChange={e => setLogForm(f => ({ ...f, impressions: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Plays</label>
            <input type="number" className="input-field py-2 text-sm" placeholder="45"
              value={logForm.plays} onChange={e => setLogForm(f => ({ ...f, plays: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Location</label>
            <input className="input-field py-2 text-sm" placeholder="Lagos"
              value={logForm.location} onChange={e => setLogForm(f => ({ ...f, location: e.target.value }))} />
          </div>
        </div>
        <button onClick={addImpressionLog} disabled={addingLog || !logForm.date || !logForm.impressions}
          className="btn-primary py-2 text-sm disabled:opacity-40">
          {addingLog ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Log</>}
        </button>
      </div>

      {/* Quote breakdown */}
      {campaign.quote && (
        <div className="glass-card p-5 border border-gold/20">
          <h3 className="font-semibold text-white mb-4 text-sm">Quote Breakdown</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Media Cost', value: formatCurrency(campaign.quote.totalMediaCost) },
              { label: 'Agency Fee (10%)', value: formatCurrency(campaign.quote.agencyFee) },
              { label: 'Ad Conversion Fee', value: formatCurrency(campaign.quote.conversionFee) },
              { label: 'VAT (7.5%)', value: formatCurrency(campaign.quote.vatAmount) },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-mono">{item.value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-cinema-border font-bold text-base">
              <span className="text-white">Grand Total</span>
              <span className="gold-text font-display">{formatCurrency(campaign.quote.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* AUDIENCE & FILM INTELLIGENCE */}
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
