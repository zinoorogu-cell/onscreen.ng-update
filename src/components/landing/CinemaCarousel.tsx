'use client'

import { Film, MapPin } from 'lucide-react'

interface Cinema {
  id: string
  name: string
  city: string
  state: string
  logoUrl?: string | null
}

const CINEMA_COLORS = [
  'from-brand-600/20 to-brand-800/20 border-brand-600/30',
  'from-gold/10 to-gold/5 border-gold/20',
  'from-purple-600/20 to-purple-800/20 border-purple-600/30',
  'from-cyan-600/20 to-cyan-800/20 border-cyan-600/30',
  'from-emerald-600/20 to-emerald-800/20 border-emerald-600/30',
]

function CinemaCard({ cinema, index }: { cinema: Cinema; index: number }) {
  const colorClass = CINEMA_COLORS[index % CINEMA_COLORS.length]

  return (
    <div
      className={`flex-shrink-0 w-64 glass-card bg-gradient-to-br ${colorClass} p-5 mx-3 card-hover`}
    >
      {/* Logo / Icon */}
      <div className="w-14 h-14 rounded-xl bg-cinema-darker/80 border border-cinema-border flex items-center justify-center mb-4 overflow-hidden">
        {cinema.logoUrl ? (
          <img src={cinema.logoUrl} alt={cinema.name} className="w-full h-full object-contain p-1" />
        ) : (
          <Film className="w-6 h-6 text-brand-400" />
        )}
      </div>

      <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{cinema.name}</h3>
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <MapPin className="w-3 h-3" />
        <span>{cinema.city}, {cinema.state}</span>
      </div>
    </div>
  )
}

export function CinemaCarousel({ cinemas }: { cinemas: Cinema[] }) {
  // Duplicate cinemas for seamless loop
  const doubled = [...cinemas, ...cinemas, ...cinemas]

  if (cinemas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No cinemas available yet
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-cinema-dark to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-cinema-dark to-transparent z-10 pointer-events-none" />

      <div className="marquee-wrapper py-4">
        <div className="marquee-content">
          {doubled.map((cinema, i) => (
            <CinemaCard key={`${cinema.id}-${i}`} cinema={cinema} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
