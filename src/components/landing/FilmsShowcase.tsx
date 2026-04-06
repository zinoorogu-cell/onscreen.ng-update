'use client'

import { useState, useEffect } from 'react'
import { Film, Star, Clock, ChevronRight, Play, Calendar } from 'lucide-react'

interface FilmData {
  id: string
  title: string
  category: 'NOLLYWOOD' | 'HOLLYWOOD' | 'BOLLYWOOD' | 'ANIMATION' | 'DOCUMENTARY' | 'OTHER'
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED'
  posterUrl?: string | null
  synopsis?: string | null
  genre?: string | null
  rating?: string | null
  durationMins?: number | null
  releaseDate?: string | null
  audienceGender: string
  audienceAge: string
  _count?: { schedules: number }
}

const CATEGORY_COLORS: Record<string, string> = {
  NOLLYWOOD: 'from-green-600/30 to-green-900/20 border-green-500/30 text-green-400',
  HOLLYWOOD: 'from-blue-600/30 to-blue-900/20 border-blue-500/30 text-blue-400',
  BOLLYWOOD: 'from-pink-600/30 to-pink-900/20 border-pink-500/30 text-pink-400',
  ANIMATION: 'from-yellow-600/30 to-yellow-900/20 border-yellow-500/30 text-yellow-400',
  DOCUMENTARY: 'from-purple-600/30 to-purple-900/20 border-purple-500/30 text-purple-400',
  OTHER: 'from-gray-600/30 to-gray-900/20 border-gray-500/30 text-gray-400',
}

const CATEGORY_LABELS: Record<string, string> = {
  NOLLYWOOD: '🎬 Nollywood',
  HOLLYWOOD: '🎥 Hollywood',
  BOLLYWOOD: '💃 Bollywood',
  ANIMATION: '🎠 Animation',
  DOCUMENTARY: '📽️ Documentary',
  OTHER: '🎦 Other',
}

function FilmCard({ film }: { film: FilmData }) {
  const [hovered, setHovered] = useState(false)
  const catColor = CATEGORY_COLORS[film.category] || CATEGORY_COLORS.OTHER
  const catBadgeBg = catColor.split(' ').slice(2).join(' ')

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative bg-cinema-card">
        {film.posterUrl ? (
          <img
            src={film.posterUrl}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${catColor.split(' ').slice(0, 2).join(' ')} flex flex-col items-center justify-center gap-4 p-4`}>
            <Film className="w-12 h-12 text-gray-400" />
            <span className="text-gray-400 text-sm text-center font-medium">{film.title}</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-cinema-darker/90 flex flex-col justify-end p-4 transition-all duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          {film.synopsis && (
            <p className="text-gray-300 text-xs leading-relaxed line-clamp-4 mb-3">{film.synopsis}</p>
          )}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {film.durationMins && (
              <span className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />{film.durationMins}min
              </span>
            )}
            {film.rating && (
              <span className="px-2 py-0.5 bg-cinema-muted rounded text-gray-300">{film.rating}</span>
            )}
            {film.genre && (
              <span className="px-2 py-0.5 bg-cinema-muted rounded text-gray-300">{film.genre}</span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {film.status === 'NOW_SHOWING' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              NOW SHOWING
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold/90 backdrop-blur-sm text-cinema-darker text-xs font-bold rounded-full">
              <Calendar className="w-3 h-3" />
              COMING SOON
            </span>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-lg border backdrop-blur-sm bg-cinema-darker/80 ${catBadgeBg}`}>
            {film.category === 'NOLLYWOOD' ? '🇳🇬' : film.category === 'HOLLYWOOD' ? '🇺🇸' : film.category === 'BOLLYWOOD' ? '🇮🇳' : film.category === 'ANIMATION' ? '🎠' : '🎦'}
          </span>
        </div>
      </div>

      {/* Info below poster */}
      <div className="p-3 bg-cinema-card border border-cinema-border border-t-0 rounded-b-2xl">
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1 mb-1">{film.title}</h3>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${catBadgeBg.split(' ').pop()}`}>
            {CATEGORY_LABELS[film.category]}
          </span>
          {film.releaseDate && film.status === 'COMING_SOON' && (
            <span className="text-xs text-gray-500">
              {new Date(film.releaseDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {film._count?.schedules ? (
            <span className="text-xs text-gray-500">{film._count.schedules} cinema{film._count.schedules !== 1 ? 's' : ''}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function FilmsShowcase() {
  const [films, setFilms] = useState<FilmData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'NOW_SHOWING' | 'COMING_SOON'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'NOLLYWOOD' | 'HOLLYWOOD'>('ALL')

  useEffect(() => {
    fetch('/api/films')
      .then(r => r.json())
      .then(d => {
        setFilms(d.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = films.filter(f => {
    const matchStatus = activeFilter === 'ALL' || f.status === activeFilter
    const matchCat = categoryFilter === 'ALL' || f.category === categoryFilter
    return matchStatus && matchCat && f.status !== 'ENDED'
  })

  const nowShowing = films.filter(f => f.status === 'NOW_SHOWING').length
  const comingSoon = films.filter(f => f.status === 'COMING_SOON').length

  if (!loading && films.length === 0) return null

  return (
    <section className="py-24 bg-cinema-dark/50 border-y border-cinema-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-600/20 border border-brand-600/30 rounded-full text-brand-400 text-xs font-medium mb-3">
              <Film className="w-3.5 h-3.5" />
              Nigeria Cinema Programme
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              <span className="text-white">What's Playing </span>
              <span className="gold-text">This Week</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Films currently in Nigerian cinemas — your ad runs alongside these titles
            </p>
          </div>

          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 glass-card p-1">
              {[
                { key: 'ALL', label: `All (${films.filter(f => f.status !== 'ENDED').length})` },
                { key: 'NOW_SHOWING', label: `Now Showing (${nowShowing})` },
                { key: 'COMING_SOON', label: `Coming Soon (${comingSoon})` },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setActiveFilter(opt.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === opt.key ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1 glass-card p-1">
              {[
                { key: 'ALL', label: '🎬 All' },
                { key: 'NOLLYWOOD', label: '🇳🇬 Nollywood' },
                { key: 'HOLLYWOOD', label: '🇺🇸 Hollywood' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setCategoryFilter(opt.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    categoryFilter === opt.key ? 'bg-gold/20 text-gold border border-gold/30' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Films grid — 4 columns */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[2/3] skeleton rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No films found for this filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5">
            {filtered.map(film => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Your ad plays <span className="text-white font-medium">before and between</span> these films — reaching their exact audience
          </p>
          <a href="/signup" className="btn-primary inline-flex">
            Advertise Alongside These Films
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
