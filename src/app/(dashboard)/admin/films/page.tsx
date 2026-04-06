'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Search, Film, Edit2, Trash2, X, Save, Loader2,
  Calendar, Clock, Star, ChevronDown, ChevronUp, Monitor,
} from 'lucide-react'

const CATEGORIES = ['NOLLYWOOD', 'HOLLYWOOD', 'BOLLYWOOD', 'ANIMATION', 'DOCUMENTARY', 'OTHER']
const STATUSES = ['NOW_SHOWING', 'COMING_SOON', 'ENDED']
const GENDERS = ['MIXED', 'MALE', 'FEMALE']
const AGES = ['MIXED', 'CHILDREN', 'TEENS', 'YOUNG_ADULTS', 'ADULTS']
const TIME_SLOTS = ['MORNING', 'AFTERNOON', 'EVENING', 'ALL_DAY']

const CAT_COLORS: Record<string, string> = {
  NOLLYWOOD: 'text-green-400 bg-green-500/10 border-green-500/30',
  HOLLYWOOD: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  BOLLYWOOD: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  ANIMATION: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  DOCUMENTARY: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  OTHER: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  NOW_SHOWING: 'Now Showing',
  COMING_SOON: 'Coming Soon',
  ENDED: 'Ended',
}

const emptyForm = {
  title: '',
  category: 'NOLLYWOOD',
  status: 'NOW_SHOWING',
  posterUrl: '',
  trailerUrl: '',
  synopsis: '',
  director: '',
  cast: '',
  genre: '',
  rating: 'PG',
  durationMins: '',
  audienceGender: 'MIXED',
  audienceAge: 'MIXED',
  releaseDate: '',
  endDate: '',
  isFeatured: false,
  sortOrder: '0',
}

export default function AdminFilmsPage() {
  const [films, setFilms] = useState<any[]>([])
  const [cinemas, setCinemas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterCat, setFilterCat] = useState('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  // Schedule form
  const [schedForm, setSchedForm] = useState({
    filmId: '', screenId: '', cinemaId: '', weekStartDate: '', showtimesPerDay: '5',
    timeSlots: ['MORNING', 'AFTERNOON', 'EVENING'] as string[],
  })
  const [schedSaving, setSchedSaving] = useState(false)

  const loadFilms = async () => {
    const res = await fetch('/api/films?status=ALL')
    const d = await res.json()
    setFilms(d.data || [])
    setLoading(false)
  }

  const loadCinemas = async () => {
    const res = await fetch('/api/cinemas')
    const d = await res.json()
    setCinemas(d.data || [])
  }

  useEffect(() => {
    loadFilms()
    loadCinemas()
  }, [])

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const url = editingId ? `/api/films/${editingId}` : '/api/films'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await loadFilms()
      setShowForm(false)
      setEditingId(null)
      setForm({ ...emptyForm })
    }
    setSaving(false)
  }

  const handleEdit = (film: any) => {
    setForm({
      title: film.title || '',
      category: film.category || 'NOLLYWOOD',
      status: film.status || 'NOW_SHOWING',
      posterUrl: film.posterUrl || '',
      trailerUrl: film.trailerUrl || '',
      synopsis: film.synopsis || '',
      director: film.director || '',
      cast: film.cast || '',
      genre: film.genre || '',
      rating: film.rating || 'PG',
      durationMins: film.durationMins?.toString() || '',
      audienceGender: film.audienceGender || 'MIXED',
      audienceAge: film.audienceAge || 'MIXED',
      releaseDate: film.releaseDate ? film.releaseDate.split('T')[0] : '',
      endDate: film.endDate ? film.endDate.split('T')[0] : '',
      isFeatured: film.isFeatured || false,
      sortOrder: film.sortOrder?.toString() || '0',
    })
    setEditingId(film.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this film?')) return
    await fetch(`/api/films/${id}`, { method: 'DELETE' })
    await loadFilms()
  }

  const handleAddSchedule = async () => {
    if (!schedForm.filmId || !schedForm.screenId || !schedForm.cinemaId || !schedForm.weekStartDate) return
    setSchedSaving(true)
    await fetch('/api/films/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedForm),
    })
    await loadFilms()
    setSchedSaving(false)
  }

  const handleRemoveSchedule = async (schedId: string) => {
    await fetch(`/api/films/schedules?id=${schedId}`, { method: 'DELETE' })
    await loadFilms()
  }

  const toggleTimeSlot = (slot: string) => {
    setSchedForm(f => ({
      ...f,
      timeSlots: f.timeSlots.includes(slot)
        ? f.timeSlots.filter(s => s !== slot)
        : [...f.timeSlots, slot],
    }))
  }

  // Get screens for selected cinema
  const selectedCinemaScreens = cinemas.find((c: any) => c.id === schedForm.cinemaId)?.screens || []

  const filtered = films.filter(f => {
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || f.status === filterStatus
    const matchCat = filterCat === 'ALL' || f.category === filterCat
    return matchSearch && matchStatus && matchCat
  })

  // Get Monday of current week as default
  const getMonday = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Film Programme</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Now Showing & Coming Soon films across all cinemas</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }) }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Film
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="glass-card p-6 border border-brand-600/30 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white text-lg">
              {editingId ? 'Edit Film' : 'Add New Film'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null) }}
              className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left — poster preview */}
            <div className="space-y-4">
              <div>
                <label className="label text-xs">Poster URL</label>
                <input className="input-field text-sm" placeholder="https://..."
                  value={form.posterUrl} onChange={e => upd('posterUrl', e.target.value)} />
              </div>
              {/* Poster preview */}
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-cinema-darker border border-cinema-border flex items-center justify-center">
                {form.posterUrl ? (
                  <img src={form.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-600">
                    <Film className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-xs">Poster preview</span>
                  </div>
                )}
              </div>
              <div>
                <label className="label text-xs">Trailer / IMDB URL</label>
                <input className="input-field text-sm" placeholder="https://youtube.com/..."
                  value={form.trailerUrl} onChange={e => upd('trailerUrl', e.target.value)} />
              </div>
            </div>

            {/* Middle — main details */}
            <div className="space-y-4">
              <div>
                <label className="label text-xs">Film Title *</label>
                <input className="input-field" placeholder="e.g. A Tribe Called Judah"
                  value={form.title} onChange={e => upd('title', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Category *</label>
                  <select className="input-field text-sm" value={form.category} onChange={e => upd('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Status *</label>
                  <select className="input-field text-sm" value={form.status} onChange={e => upd('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Genre</label>
                  <input className="input-field text-sm" placeholder="Action, Drama..." value={form.genre} onChange={e => upd('genre', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Rating</label>
                  <select className="input-field text-sm" value={form.rating} onChange={e => upd('rating', e.target.value)}>
                    {['G', 'PG', 'PG-13', '15', '18'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Duration (mins)</label>
                  <input type="number" className="input-field text-sm" placeholder="120" value={form.durationMins} onChange={e => upd('durationMins', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Sort Order</label>
                  <input type="number" className="input-field text-sm" placeholder="0" value={form.sortOrder} onChange={e => upd('sortOrder', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label text-xs">Director</label>
                <input className="input-field text-sm" placeholder="Director name" value={form.director} onChange={e => upd('director', e.target.value)} />
              </div>

              <div>
                <label className="label text-xs">Cast</label>
                <input className="input-field text-sm" placeholder="Lead actors" value={form.cast} onChange={e => upd('cast', e.target.value)} />
              </div>
            </div>

            {/* Right — audience & dates */}
            <div className="space-y-4">
              <div>
                <label className="label text-xs">Synopsis</label>
                <textarea className="input-field resize-none text-sm" rows={4}
                  placeholder="Brief film description..." value={form.synopsis} onChange={e => upd('synopsis', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Release Date</label>
                  <input type="date" className="input-field text-sm" value={form.releaseDate} onChange={e => upd('releaseDate', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">End Date</label>
                  <input type="date" className="input-field text-sm" value={form.endDate} onChange={e => upd('endDate', e.target.value)} />
                </div>
              </div>

              <div className="glass-card p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Audience Profile</div>
                <div>
                  <label className="label text-xs">Gender Split</label>
                  <select className="input-field text-sm" value={form.audienceGender} onChange={e => upd('audienceGender', e.target.value)}>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Age Group</label>
                  <select className="input-field text-sm" value={form.audienceAge} onChange={e => upd('audienceAge', e.target.value)}>
                    {AGES.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => upd('isFeatured', e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-5 bg-cinema-muted rounded-full peer peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
                <span className="text-sm text-gray-300">Featured on homepage</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cinema-border">
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="btn-outline py-2">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="btn-gold py-2 disabled:opacity-40">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingId ? 'Update Film' : 'Add Film'}</>}
            </button>
          </div>
        </div>
      )}

      {/* SCHEDULE ASSIGNER */}
      <div className="glass-card p-5 border border-gold/20">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          Assign Film to Screen (Weekly Schedule)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="label text-xs">Film</label>
            <select className="input-field text-sm" value={schedForm.filmId}
              onChange={e => setSchedForm(f => ({ ...f, filmId: e.target.value }))}>
              <option value="">Select film...</option>
              {films.filter(f => f.status !== 'ENDED').map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Cinema</label>
            <select className="input-field text-sm" value={schedForm.cinemaId}
              onChange={e => setSchedForm(f => ({ ...f, cinemaId: e.target.value, screenId: '' }))}>
              <option value="">Select cinema...</option>
              {cinemas.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Screen</label>
            <select className="input-field text-sm" value={schedForm.screenId}
              onChange={e => setSchedForm(f => ({ ...f, screenId: e.target.value }))}
              disabled={!schedForm.cinemaId}>
              <option value="">Select screen...</option>
              {selectedCinemaScreens.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.seatingCapacity} seats)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Week Starting (Mon)</label>
            <input type="date" className="input-field text-sm"
              defaultValue={getMonday()}
              onChange={e => setSchedForm(f => ({ ...f, weekStartDate: e.target.value }))} />
          </div>
          <div>
            <label className="label text-xs">Showtimes/day</label>
            <input type="number" className="input-field text-sm" min="1" max="10"
              value={schedForm.showtimesPerDay}
              onChange={e => setSchedForm(f => ({ ...f, showtimesPerDay: e.target.value }))} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div>
            <label className="label text-xs">Time Slots</label>
            <div className="flex gap-2">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => toggleTimeSlot(slot)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    schedForm.timeSlots.includes(slot)
                      ? 'border-brand-500 bg-brand-600/20 text-white'
                      : 'border-cinema-border text-gray-500 hover:border-cinema-muted'
                  }`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAddSchedule}
            disabled={schedSaving || !schedForm.filmId || !schedForm.screenId || !schedForm.weekStartDate}
            className="btn-primary py-2 mt-4 disabled:opacity-40">
            {schedSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Assign</>}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search films..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 glass-card p-1">
          {['ALL', 'NOW_SHOWING', 'COMING_SOON', 'ENDED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterStatus === s ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 glass-card p-1">
          {['ALL', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterCat === c ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {c === 'ALL' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* FILMS TABLE */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Film className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No films found. Add your first film above.</p>
            </div>
          )}
          {filtered.map(film => (
            <div key={film.id} className="glass-card overflow-hidden">
              {/* Film row */}
              <div className="flex items-center gap-4 p-4">
                {/* Poster thumb */}
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-cinema-darker border border-cinema-border flex-shrink-0">
                  {film.posterUrl ? (
                    <img src={film.posterUrl} alt={film.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{film.title}</h3>
                    {film.isFeatured && (
                      <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className={`badge border ${CAT_COLORS[film.category]}`}>{film.category}</span>
                    <span className={`badge border ${film.status === 'NOW_SHOWING' ? 'badge-active' : film.status === 'COMING_SOON' ? 'badge-pending' : 'badge-rejected'}`}>
                      {STATUS_LABELS[film.status]}
                    </span>
                    {film.genre && <span className="text-gray-500">{film.genre}</span>}
                    {film.durationMins && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />{film.durationMins}min
                      </span>
                    )}
                    {film.rating && <span className="text-gray-500 border border-cinema-border px-1.5 rounded">{film.rating}</span>}
                    <span className="text-gray-600 flex items-center gap-1">
                      <Monitor className="w-3 h-3" />{film._count?.schedules || 0} screen assignment{film._count?.schedules !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {film.releaseDate && (
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {film.status === 'COMING_SOON' ? 'Releases' : 'Released'}: {new Date(film.releaseDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>

                {/* Audience badge */}
                <div className="hidden lg:block text-right text-xs text-gray-500 flex-shrink-0">
                  <div>👥 {film.audienceGender}</div>
                  <div>🎯 {film.audienceAge}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setExpandedId(expandedId === film.id ? null : film.id)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-cinema-border text-gray-400 hover:text-white hover:border-cinema-muted transition-all flex items-center gap-1">
                    Schedules {expandedId === film.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button onClick={() => handleEdit(film)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-cinema-card transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(film.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded schedules */}
              {expandedId === film.id && (
                <div className="border-t border-cinema-border bg-cinema-darker/50 px-4 py-3 animate-fade-in">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Current Screen Assignments
                  </div>
                  {!film.schedules?.length ? (
                    <p className="text-xs text-gray-600 italic">No screens assigned yet. Use the schedule assigner above.</p>
                  ) : (
                    <div className="space-y-2">
                      {film.schedules.map((sched: any) => (
                        <div key={sched.id} className="flex items-center justify-between py-2 px-3 bg-cinema-card rounded-lg text-xs">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-3.5 h-3.5 text-brand-400" />
                            <div>
                              <span className="text-white font-medium">{sched.cinema?.name}</span>
                              <span className="text-gray-500 ml-2">{sched.screen?.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(sched.weekStartDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} –
                              {new Date(sched.weekEndDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                            </span>
                            <span>{sched.showtimesPerDay}/day</span>
                            <span>{sched.timeSlots?.join(', ')}</span>
                            <button onClick={() => handleRemoveSchedule(sched.id)}
                              className="text-red-500/60 hover:text-red-400 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
