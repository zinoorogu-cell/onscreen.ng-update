'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Film, MapPin, Monitor, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react'

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', state: '', address: '', description: '',
    screens: [{ name: 'Screen 1', seatingCapacity: 200, showtimesPerDay: 5, basePrice: 80000 }],
  })

  const loadCinemas = () => {
    fetch('/api/cinemas?approved=all').then(r => r.json()).then(d => {
      setCinemas(d.data || [])
      setLoading(false)
    })
  }

  useEffect(() => { loadCinemas() }, [])

  const addScreen = () => {
    setForm(f => ({
      ...f,
      screens: [...f.screens, { name: `Screen ${f.screens.length + 1}`, seatingCapacity: 150, showtimesPerDay: 5, basePrice: 60000 }],
    }))
  }

  const updateScreen = (i: number, field: string, value: any) => {
    setForm(f => ({
      ...f,
      screens: f.screens.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }))
  }

  const handleCreate = async () => {
    setSaving(true)
    const res = await fetch('/api/cinemas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, screenConfig: form.screens }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', city: '', state: '', address: '', description: '', screens: [{ name: 'Screen 1', seatingCapacity: 200, showtimesPerDay: 5, basePrice: 80000 }] })
      loadCinemas()
    }
    setSaving(false)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/cinemas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    loadCinemas()
  }

  const filtered = cinemas.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Cinema Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage partner cinemas and screens</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Cinema
        </button>
      </div>

      {/* Add Cinema Form */}
      {showForm && (
        <div className="glass-card p-6 border border-brand-600/30 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Add New Cinema</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div><label className="label text-xs">Cinema Name *</label><input className="input-field" placeholder="Cinema name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label text-xs">City *</label><input className="input-field" placeholder="Lagos" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><label className="label text-xs">State *</label><input className="input-field" placeholder="Lagos" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
            <div><label className="label text-xs">Address *</label><input className="input-field" placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="sm:col-span-2"><label className="label text-xs">Description</label><input className="input-field" placeholder="Brief description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Screens</h4>
              <button onClick={addScreen} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add Screen</button>
            </div>
            <div className="space-y-3">
              {form.screens.map((screen, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-cinema-darker rounded-lg">
                  <div><label className="text-xs text-gray-500 block mb-1">Name</label><input className="input-field py-2 text-sm" value={screen.name} onChange={e => updateScreen(i, 'name', e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Seats</label><input type="number" className="input-field py-2 text-sm" value={screen.seatingCapacity} onChange={e => updateScreen(i, 'seatingCapacity', parseInt(e.target.value))} /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Showtimes/day</label><input type="number" className="input-field py-2 text-sm" value={screen.showtimesPerDay} onChange={e => updateScreen(i, 'showtimesPerDay', parseInt(e.target.value))} /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Base Price (₦)</label><input type="number" className="input-field py-2 text-sm" value={screen.basePrice} onChange={e => updateScreen(i, 'basePrice', parseInt(e.target.value))} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="btn-outline py-2">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.name || !form.city} className="btn-primary py-2 disabled:opacity-40">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Check className="w-4 h-4" />Save Cinema</>}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input-field pl-10" placeholder="Search cinemas..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Cinemas table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="table-header">Cinema</th>
                <th className="table-header hidden md:table-cell">Location</th>
                <th className="table-header hidden sm:table-cell">Screens</th>
                <th className="table-header hidden lg:table-cell">Total Seats</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border">
              {filtered.map(cinema => (
                <tr key={cinema.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                        <Film className="w-4 h-4 text-brand-400" />
                      </div>
                      <span className="text-white font-medium">{cinema.name}</span>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin className="w-3 h-3" />{cinema.city}, {cinema.state}
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Monitor className="w-3 h-3" />{cinema.screens?.length || 0}
                    </div>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-400">
                    {(cinema.screens || []).reduce((s: number, sc: any) => s + sc.seatingCapacity, 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span className={cinema.isActive ? 'badge-active' : 'badge-rejected'}>
                      {cinema.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleActive(cinema.id, cinema.isActive)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-cinema-border hover:border-cinema-muted text-gray-400 hover:text-white transition-all">
                        {cinema.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-500">No cinemas found</div>
          )}
        </div>
      )}
    </div>
  )
}
