'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Film, Calendar, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/impressions'

export default function AdvertiserRFQsPage() {
  const [rfqs, setRfqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/rfq').then(r => r.json()).then(d => {
      setRfqs(d.data || [])
      setLoading(false)
    })
  }, [])

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', QUOTED: 'badge-quoted', ACCEPTED: 'badge-accepted',
      REJECTED: 'badge-rejected', CANCELLED: 'badge-rejected',
    }
    return map[status] || 'badge'
  }

  const FILTERS = ['ALL', 'PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED']

  const filtered = rfqs.filter(r => {
    const matchSearch = r.campaignName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || r.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Track all your advertising requests</p>
        </div>
        <Link href="/advertiser/rfq/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New RFQ
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search campaigns..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 glass-card p-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No requests found</h3>
          <p className="text-gray-500 text-sm mb-6">Submit your first RFQ to get started</p>
          <Link href="/advertiser/rfq/new" className="btn-primary">
            <Plus className="w-4 h-4" /> New RFQ
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rfq => (
            <Link key={rfq.id} href={`/advertiser/rfq/${rfq.id}`}
              className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover block">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{rfq.campaignName}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                      {new Date(rfq.durationStart).toLocaleDateString()} – {new Date(rfq.durationEnd).toLocaleDateString()}
                    </span>
                    <span>{rfq.items?.length || 0} cinema{rfq.items?.length !== 1 ? 's' : ''}</span>
                    <span>{rfq.brandName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                <span className={statusBadge(rfq.status)}>{rfq.status}</span>
                {rfq.quote?.grandTotal && (
                  <div className="text-sm font-mono text-white">{formatCurrency(rfq.quote.grandTotal)}</div>
                )}
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
