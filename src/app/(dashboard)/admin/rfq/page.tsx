'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, FileText, Calendar, ChevronRight, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/impressions'

export default function AdminRFQPage() {
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

  const FILTERS = ['ALL', 'PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED']

  const filtered = rfqs.filter(r => {
    const matchSearch =
      r.campaignName.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.company?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || r.status === filter
    return matchSearch && matchFilter
  })

  const statusBadge = (s: string) => ({ PENDING: 'badge-pending', QUOTED: 'badge-quoted', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected' }[s] || 'badge')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">RFQ Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and respond to advertiser requests</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search by campaign or brand..."
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
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="table-header">Campaign</th>
                <th className="table-header hidden md:table-cell">Brand</th>
                <th className="table-header hidden lg:table-cell">Duration</th>
                <th className="table-header hidden sm:table-cell">Cinemas</th>
                <th className="table-header">Status</th>
                <th className="table-header hidden md:table-cell">Quote</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border">
              {filtered.map(rfq => (
                <tr key={rfq.id} className="hover:bg-cinema-card/50 transition-colors group">
                  <td className="table-cell">
                    <div className="font-medium text-white group-hover:text-brand-300 transition-colors">{rfq.campaignName}</div>
                    <div className="text-xs text-gray-600">{new Date(rfq.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <div>{rfq.user?.company || rfq.user?.name}</div>
                    <div className="text-xs text-gray-600">{rfq.user?.email}</div>
                  </td>
                  <td className="table-cell hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      {new Date(rfq.durationStart).toLocaleDateString()} –
                    </div>
                    <div className="text-xs text-gray-500 ml-4">{new Date(rfq.durationEnd).toLocaleDateString()}</div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">{rfq.items?.length || 0}</td>
                  <td className="table-cell"><span className={statusBadge(rfq.status)}>{rfq.status}</span></td>
                  <td className="table-cell hidden md:table-cell font-mono text-sm">
                    {rfq.quote?.grandTotal ? formatCurrency(rfq.quote.grandTotal) : '—'}
                  </td>
                  <td className="table-cell">
                    <Link href={`/admin/rfq/${rfq.id}`}
                      className="inline-flex items-center gap-1 text-brand-400 text-xs hover:text-brand-300">
                      {rfq.status === 'PENDING' ? 'Quote' : 'View'} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No RFQs found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
