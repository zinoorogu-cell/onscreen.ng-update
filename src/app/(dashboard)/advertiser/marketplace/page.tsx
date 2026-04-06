'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Film, Users, Monitor, Filter, Plus } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/impressions'

export default function MarketplacePage() {
  const [cinemas, setCinemas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/cinemas').then(r => r.json()).then(d => {
      setCinemas(d.data || [])
      setLoading(false)
    })
  }, [])

  const cities = ['ALL', ...new Set(cinemas.map((c: any) => c.city))]

  const filtered = cinemas.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    const matchCity = cityFilter === 'ALL' || c.city === cityFilter
    return matchSearch && matchCity
  })

  const totalCapacity = (cinema: any) =>
    cinema.screens?.reduce((s: number, sc: any) => s + sc.seatingCapacity, 0) || 0

  const avgPrice = (cinema: any) => {
    const screens = cinema.screens || []
    if (!screens.length) return 0
    return screens.reduce((s: number, sc: any) => s + sc.basePrice, 0) / screens.length
  }

  const estDailyImpressions = (cinema: any) => {
    return (cinema.screens || []).reduce((s: number, sc: any) =>
      s + Math.round(sc.seatingCapacity * 0.6 * sc.showtimesPerDay), 0)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Inventory Marketplace</h1>
          <p className="text-gray-500 text-sm mt-1">Browse available cinema and advertising locations</p>
        </div>
        <Link href="/advertiser/rfq/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Request Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search cinemas, cities..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 glass-card p-1 overflow-x-auto no-scrollbar">
          {cities.map(city => (
            <button key={city} onClick={() => setCityFilter(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                cityFilter === city ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Cinemas', value: filtered.length },
          { label: 'Total Screens', value: filtered.reduce((s, c) => s + (c.screens?.length || 0), 0) },
          { label: 'Est. Daily Reach', value: formatNumber(filtered.reduce((s, c) => s + estDailyImpressions(c), 0)) },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-xl font-display font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Film className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No cinemas found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cinema => (
            <div key={cinema.id} className="glass-card overflow-hidden card-hover group">
              {/* Header */}
              <div className="bg-gradient-to-br from-brand-600/20 to-cinema-muted p-5 border-b border-cinema-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cinema-darker border border-cinema-border flex items-center justify-center flex-shrink-0">
                    {cinema.logoUrl
                      ? <img src={cinema.logoUrl} alt={cinema.name} className="w-10 h-10 object-contain" />
                      : <Film className="w-6 h-6 text-brand-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-brand-300 transition-colors">
                      {cinema.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{cinema.city}, {cinema.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Monitor className="w-3.5 h-3.5 text-brand-400" />
                    <span>{cinema.screens?.length || 0} screen{cinema.screens?.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    <span>{totalCapacity(cinema).toLocaleString()} seats</span>
                  </div>
                </div>

                <div className="border-t border-cinema-border pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. daily impressions</span>
                    <span className="text-white font-mono">{formatNumber(estDailyImpressions(cinema))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg. price/slot</span>
                    <span className="text-white font-mono">{formatCurrency(avgPrice(cinema))}</span>
                  </div>
                </div>

                {cinema.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">{cinema.description}</p>
                )}
              </div>

              {/* CTA */}
              <div className="px-4 pb-4">
                <Link href={`/advertiser/rfq/new?cinema=${cinema.id}`} className="btn-primary w-full justify-center text-xs py-2.5">
                  Request for Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
