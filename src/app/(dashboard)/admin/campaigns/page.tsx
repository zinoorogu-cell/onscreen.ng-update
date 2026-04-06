'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, BarChart2, Calendar, TrendingUp, ChevronRight, Loader2 } from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/impressions'

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  const loadCampaigns = () => {
    fetch('/api/campaigns').then(r => r.json()).then(d => {
      setCampaigns(d.data || [])
      setLoading(false)
    })
  }

  useEffect(() => { loadCampaigns() }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadCampaigns()
    setUpdating(null)
  }

  const FILTERS = ['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'PAUSED']

  const filtered = campaigns.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || c.status === filter
    return matchSearch && matchFilter
  })

  const statusBadge = (s: string) => ({ ACTIVE: 'badge-active', PENDING: 'badge-pending', COMPLETED: 'badge-completed', PAUSED: 'badge-quoted', CANCELLED: 'badge-rejected' }[s] || 'badge')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Campaigns</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and monitor all advertising campaigns</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search campaigns..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 glass-card p-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="table-header">Campaign</th>
                <th className="table-header hidden md:table-cell">Brand</th>
                <th className="table-header hidden lg:table-cell">Duration</th>
                <th className="table-header hidden sm:table-cell">Impressions</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="table-cell">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.quote ? formatCurrency(c.quote.grandTotal) : '—'}</div>
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-300">
                    {c.user?.company || c.user?.name}
                  </td>
                  <td className="table-cell hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-gray-300">
                      <TrendingUp className="w-3 h-3 text-brand-400" />
                      {formatNumber(c.totalImpressions || 0)}
                    </div>
                  </td>
                  <td className="table-cell"><span className={statusBadge(c.status)}>{c.status}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {c.status === 'PENDING' && (
                        <button onClick={() => updateStatus(c.id, 'ACTIVE')}
                          className="text-xs px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all">
                          {updating === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Activate'}
                        </button>
                      )}
                      {c.status === 'ACTIVE' && (
                        <button onClick={() => updateStatus(c.id, 'COMPLETED')}
                          className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                          Complete
                        </button>
                      )}
                      <Link href={`/admin/campaigns/${c.id}`}
                        className="text-xs px-2.5 py-1 rounded-lg border border-cinema-border text-gray-400 hover:text-white hover:border-cinema-muted transition-all flex items-center gap-1">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <BarChart2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No campaigns found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
