'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Film, Calendar, MapPin, Monitor, Clock, ChevronRight, ArrowLeft } from 'lucide-react'

const CAT_COLORS: Record<string, string> = {
  NOLLYWOOD: 'text-green-400 bg-green-500/10 border-green-500/30',
  HOLLYWOOD: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  BOLLYWOOD: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  ANIMATION: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  DOCUMENTARY: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  OTHER: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

const CAT_FLAGS: Record<string, string> = {
  NOLLYWOOD: '🇳🇬', HOLLYWOOD: '🇺🇸', BOLLYWOOD: '🇮🇳',
  ANIMATION: '🎠', DOCUMENTARY: '📽️', OTHER: '🎦',
}

function getWeekDates(offset = 0) {
  const d = new Date()
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday, label: `${monday.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}` }
}

export default function FilmSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [cinemas, setCinemas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedCinema, setSelectedCinema] = useState('ALL')

  const week = getWeekDates(weekOffset)

  useEffect(() => {
    setLoading(true)
    const weekStart = week.monday.toISOString().split('T')[0]
    Promise.all([
      fetch(`/api/films/schedules?weekStart=${weekStart}`).then(r => r.json()),
      fetch('/api/cinemas').then(r => r.json()),
    ]).then(([schedData, cinemaData]) => {
      setSchedules(schedData.data || [])
      setCinemas(cinemaData.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [weekOffset])

  // Group schedules by cinema
  const byCinema = schedules.reduce((acc: Record<string, any[]>, s) => {
    const key = s.cinema?.id || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const filteredCinemas = selectedCinema === 'ALL'
    ? Object.keys(byCinema)
    : Object.keys(byCinema).filter(id => id === selectedCinema)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Weekly Film Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">Films currently playing across partner cinemas</p>
        </div>
        <Link href="/advertiser/rfq/new" className="btn-primary">
          <Film className="w-4 h-4" /> Advertise Alongside
        </Link>
      </div>

      {/* Week Navigator */}
      <div className="glass-card p-4 flex items-center justify-between">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="btn-outline py-2 px-4 text-sm">← Prev Week</button>
        <div className="text-center">
          <div className="text-white font-semibold">{week.label}</div>
          <div className="text-gray-500 text-xs mt-0.5">
            {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
          </div>
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="btn-outline py-2 px-4 text-sm">Next Week →</button>
      </div>

      {/* Cinema filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setSelectedCinema('ALL')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl border text-sm transition-all ${selectedCinema === 'ALL' ? 'bg-brand-600 border-brand-600 text-white' : 'border-cinema-border text-gray-400 hover:text-white'}`}>
          All Cinemas
        </button>
        {cinemas.map((c: any) => (
          <button key={c.id} onClick={() => setSelectedCinema(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition-all ${selectedCinema === c.id ? 'bg-brand-600 border-brand-600 text-white' : 'border-cinema-border text-gray-400 hover:text-white'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : filteredCinemas.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No schedule for this week</h3>
          <p className="text-gray-500 text-sm">Admin is programming films for this period</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCinemas.map(cinemaId => {
            const cinemaSchedules = byCinema[cinemaId]
            const cinema = cinemaSchedules[0]?.cinema

            return (
              <div key={cinemaId} className="glass-card overflow-hidden">
                {/* Cinema header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-cinema-border bg-cinema-card/50">
                  <div className="w-9 h-9 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                    <Film className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{cinema?.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{cinema?.city}
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">
                    {cinemaSchedules.length} film{cinemaSchedules.length !== 1 ? 's' : ''} this week
                  </div>
                </div>

                {/* Film cards */}
                <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {cinemaSchedules.map((sched: any) => {
                    const film = sched.film
                    const catColor = CAT_COLORS[film?.category] || CAT_COLORS.OTHER

                    return (
                      <div key={sched.id}
                        className="flex gap-3 p-3 rounded-xl border border-cinema-border bg-cinema-darker hover:border-brand-500/30 transition-all">
                        {/* Mini poster */}
                        <div className="w-14 h-20 rounded-lg overflow-hidden bg-cinema-card border border-cinema-border flex-shrink-0">
                          {film?.posterUrl ? (
                            <img src={film.posterUrl} alt={film.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-white text-xs font-semibold leading-tight mb-1 line-clamp-2">
                            {film?.title}
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${catColor} inline-flex items-center gap-1 mb-1`}>
                            {CAT_FLAGS[film?.category]} {film?.category}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                            <Monitor className="w-2.5 h-2.5" />
                            {sched.screen?.name}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock className="w-2.5 h-2.5" />
                            {sched.showtimesPerDay}× daily
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {sched.timeSlots?.map((slot: string) => (
                              <span key={slot} className="text-[9px] px-1.5 py-0.5 bg-cinema-muted rounded text-gray-400">
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CTA */}
      <div className="glass-card p-6 text-center border border-brand-600/20">
        <p className="text-gray-300 text-sm mb-3">
          Want your ad running alongside these films? Submit an RFQ and reach their audience.
        </p>
        <Link href="/advertiser/rfq/new" className="btn-gold inline-flex">
          Request for Quote <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
