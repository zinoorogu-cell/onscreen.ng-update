'use client'

import { useState } from 'react'
import { Package, Film, Info } from 'lucide-react'

export default function MediaOwnerInventoryPage() {
  const [form, setForm] = useState({
    name: '', city: '', state: '', address: '', description: '',
    screenName: '', seatingCapacity: '', showtimesPerDay: '', basePrice: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Submit Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">Register your cinema for the Onscreen.ng marketplace</p>
      </div>

      {submitted ? (
        <div className="glass-card p-8 text-center border border-green-500/30">
          <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Film className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">Submitted for Review</h2>
          <p className="text-gray-400 text-sm">Our team will review your cinema and approve it within 24-48 hours. You'll receive an email notification once approved.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <div className="flex items-start gap-3 p-4 bg-brand-600/10 border border-brand-600/30 rounded-xl">
            <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              All cinema submissions are reviewed by our admin team. Once approved, your inventory will appear in the marketplace and brands can request advertising slots.
            </div>
          </div>

          <h3 className="font-semibold text-white">Cinema Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Cinema Name *</label><input required className="input-field" placeholder="Cinema name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">City *</label><input required className="input-field" placeholder="Lagos" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><label className="label">State *</label><input required className="input-field" placeholder="Lagos" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
            <div><label className="label">Address *</label><input required className="input-field" placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input-field resize-none" rows={2} placeholder="Describe your cinema..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>

          <h3 className="font-semibold text-white">Primary Screen Info</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Screen Name *</label><input required className="input-field" placeholder="Screen 1 / Main Hall" value={form.screenName} onChange={e => setForm(f => ({ ...f, screenName: e.target.value }))} /></div>
            <div><label className="label">Seating Capacity *</label><input required type="number" className="input-field" placeholder="200" value={form.seatingCapacity} onChange={e => setForm(f => ({ ...f, seatingCapacity: e.target.value }))} /></div>
            <div><label className="label">Daily Showtimes *</label><input required type="number" className="input-field" placeholder="5" value={form.showtimesPerDay} onChange={e => setForm(f => ({ ...f, showtimesPerDay: e.target.value }))} /></div>
            <div><label className="label">Desired Price/Slot (₦)</label><input type="number" className="input-field" placeholder="80000" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} /></div>
          </div>

          <button type="submit" className="btn-gold w-full justify-center py-4">
            <Package className="w-4 h-4" /> Submit for Review
          </button>
        </form>
      )}
    </div>
  )
}
