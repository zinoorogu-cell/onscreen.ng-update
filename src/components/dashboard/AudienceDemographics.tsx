'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, Film, Calendar, Info } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

interface FilmAudienceData {
  aggregated: {
    totalAttendance: number
    malePercent: number
    femalePercent: number
    under18Percent: number
    age18to35: number
    age36to50: number
    age50plusPercent: number
  }
  logs: Array<{
    id: string
    date: string
    attendance: number
    film: { id: string; title: string; category: string; posterUrl?: string }
    cinema: { name: string; city: string }
  }>
}

const GENDER_COLORS = ['#f97316', '#d4af37']
const AGE_COLORS = ['#6366f1', '#22c55e', '#f97316', '#d4af37']

const CAT_FLAGS: Record<string, string> = {
  NOLLYWOOD: '🇳🇬',
  HOLLYWOOD: '🇺🇸',
  BOLLYWOOD: '🇮🇳',
  ANIMATION: '🎠',
  DOCUMENTARY: '📽️',
  OTHER: '🎦',
}

export function AudienceDemographics({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<FilmAudienceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [films, setFilms] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/films/audience?campaignId=${campaignId}`).then(r => r.json()),
      fetch('/api/films?status=ALL').then(r => r.json()),
    ]).then(([audienceData, filmsData]) => {
      setData(audienceData.data)
      setFilms(filmsData.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [campaignId])

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-3 animate-pulse">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-32 rounded-lg" />
      </div>
    )
  }

  // Films running alongside this campaign (from schedules)
  const campaignFilms = films.filter(f => f.status === 'NOW_SHOWING')

  const genderData = data ? [
    { name: 'Male', value: data.aggregated.malePercent },
    { name: 'Female', value: data.aggregated.femalePercent },
  ] : []

  const ageData = data ? [
    { name: 'Under 18', value: data.aggregated.under18Percent },
    { name: '18–35', value: data.aggregated.age18to35 },
    { name: '36–50', value: data.aggregated.age36to50 },
    { name: '50+', value: data.aggregated.age50plusPercent },
  ] : []

  return (
    <div className="space-y-5">
      {/* Films Running Alongside */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Film className="w-5 h-5 text-brand-400" />
          <h3 className="font-semibold text-white text-sm">Films Running Alongside Your Ad</h3>
        </div>

        {campaignFilms.length === 0 ? (
          <div className="flex items-start gap-3 py-3">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-500 text-sm">No film schedule data linked yet. Admin will update this as films are programmed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {campaignFilms.slice(0, 8).map(film => (
              <div key={film.id}
                className="relative rounded-xl overflow-hidden border border-cinema-border bg-cinema-card group hover:border-brand-500/40 transition-all">
                {/* Mini poster */}
                <div className="aspect-[2/3] bg-cinema-darker relative">
                  {film.posterUrl ? (
                    <img src={film.posterUrl} alt={film.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  {/* Category flag */}
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-cinema-darker/80 backdrop-blur-sm flex items-center justify-center text-sm">
                    {CAT_FLAGS[film.category] || '🎦'}
                  </div>
                  {/* Now showing badge */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-brand-600/90 backdrop-blur-sm rounded text-white text-[9px] font-bold">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      NOW SHOWING
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-white text-xs font-medium leading-tight line-clamp-2">{film.title}</div>
                  <div className="text-gray-600 text-[10px] mt-1">{film.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demographics Charts */}
      {data && data.aggregated.totalAttendance > 0 ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Gender split */}
          <div className="glass-card p-5">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              Audience Gender Split
            </h4>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {genderData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: GENDER_COLORS[i] }} />
                      <span className="text-gray-400">{d.name}</span>
                    </div>
                    <span className="text-white font-mono font-semibold">{d.value}%</span>
                  </div>
                ))}
                <div className="text-xs text-gray-600 pt-2 border-t border-cinema-border">
                  Based on {data.aggregated.totalAttendance.toLocaleString()} attendees
                </div>
              </div>
            </div>
          </div>

          {/* Age breakdown */}
          <div className="glass-card p-5">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold" />
              Age Breakdown
            </h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={ageData} layout="vertical" margin={{ left: 8, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`${v}%`]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {ageData.map((_, i) => (
                    <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="glass-card p-5 border border-cinema-border/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-white text-sm font-medium mb-1">Audience data pending</div>
              <div className="text-gray-500 text-xs leading-relaxed">
                Demographic breakdowns will appear here as your campaign runs. Admin logs audience data weekly based on cinema attendance records and film genre profiles.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
