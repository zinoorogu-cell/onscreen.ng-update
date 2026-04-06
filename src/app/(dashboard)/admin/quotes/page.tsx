'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, DollarSign, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/impressions'

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/quotes').then(r => r.json()).then(d => {
      setQuotes(d.data || [])
      setLoading(false)
    })
  }, [])

  const FILTERS = ['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']
  const statusBadge = (s: string) => ({ DRAFT: 'badge', SENT: 'badge-sent', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected' }[s] || 'badge')

  const filtered = quotes.filter(q => {
    const matchSearch =
      q.rfq?.campaignName?.toLowerCase().includes(search.toLowerCase()) ||
      q.rfq?.user?.company?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || q.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Quotes</h1>
        <p className="text-gray-500 text-sm mt-1">All generated quotes and their status</p>
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
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="table-header">Campaign</th>
                <th className="table-header hidden md:table-cell">Brand</th>
                <th className="table-header hidden sm:table-cell">Media Cost</th>
                <th className="table-header hidden lg:table-cell">Agency Fee</th>
                <th className="table-header hidden lg:table-cell">VAT</th>
                <th className="table-header">Grand Total</th>
                <th className="table-header">Status</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border">
              {filtered.map(q => (
                <tr key={q.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="table-cell">
                    <div className="text-white font-medium">{q.rfq?.campaignName}</div>
                    <div className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-300">{q.rfq?.user?.company || q.rfq?.user?.name}</td>
                  <td className="table-cell hidden sm:table-cell font-mono text-sm">{formatCurrency(q.totalMediaCost)}</td>
                  <td className="table-cell hidden lg:table-cell font-mono text-sm text-gray-400">{formatCurrency(q.agencyFee)}</td>
                  <td className="table-cell hidden lg:table-cell font-mono text-sm text-gray-400">{formatCurrency(q.vatAmount)}</td>
                  <td className="table-cell font-mono font-semibold text-gold">{formatCurrency(q.grandTotal)}</td>
                  <td className="table-cell"><span className={statusBadge(q.status)}>{q.status}</span></td>
                  <td className="table-cell">
                    <Link href={`/admin/rfq/${q.rfqId}`}
                      className="inline-flex items-center gap-1 text-brand-400 text-xs hover:text-brand-300">
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No quotes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
