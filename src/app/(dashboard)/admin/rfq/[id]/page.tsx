'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Send, Film, MapPin, Calendar, User, Loader2, Calculator } from 'lucide-react'
import { formatCurrency, calculateQuoteTotal } from '@/lib/impressions'

export default function AdminRFQDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [rfq, setRfq] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [quoteItems, setQuoteItems] = useState<Array<{
    cinemaId: string; slots: number; pricePerSlot: number; timeOfDay: string; estimatedImpressions: number
  }>>([])
  const [notes, setNotes] = useState('')
  const [validUntil, setValidUntil] = useState('')

  useEffect(() => {
    fetch(`/api/rfq/${id}`).then(r => r.json()).then(d => {
      const rfqData = d.data
      setRfq(rfqData)
      // Pre-fill from RFQ items
      if (rfqData?.items) {
        setQuoteItems(rfqData.items.map((item: any) => ({
          cinemaId: item.cinemaId,
          slots: item.slotsRequested,
          pricePerSlot: item.cinema?.screens?.[0]?.basePrice || 80000,
          timeOfDay: item.preferredTime?.[0] || 'EVENING',
          estimatedImpressions: 0,
        })))
      }
      setLoading(false)
    })
  }, [id])

  const updateItem = (i: number, field: string, value: any) => {
    setQuoteItems(items => items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const removeItem = (i: number) => {
    setQuoteItems(items => items.filter((_, idx) => idx !== i))
  }

  const totalMediaCost = quoteItems.reduce((s, item) => s + item.slots * item.pricePerSlot, 0)
  const { agencyFee, vatAmount, conversionFee, grandTotal } = calculateQuoteTotal(totalMediaCost)

  const handleSendQuote = async () => {
    setSaving(true)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rfqId: id,
        items: quoteItems,
        notes,
        validUntil: validUntil || undefined,
      }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/admin/rfq')
    }
    setSaving(false)
  }

  const statusBadge = (s: string) => ({ PENDING: 'badge-pending', QUOTED: 'badge-quoted', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected' }[s] || 'badge')

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!rfq) return <div className="text-center text-gray-500 py-20">RFQ not found</div>

  const canBuildQuote = rfq.status === 'PENDING' || rfq.status === 'QUOTED'

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/rfq" className="p-2 glass-card hover:border-cinema-muted">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-white">{rfq.campaignName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={statusBadge(rfq.status)}>{rfq.status}</span>
            <span className="text-gray-500 text-xs">
              Submitted {new Date(rfq.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" /> Advertiser
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-white">{rfq.user?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="text-white">{rfq.user?.company || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-white">{rfq.user?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Brand</span><span className="text-white">{rfq.brandName}</span></div>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" /> Campaign
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="text-white">{new Date(rfq.durationStart).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">End</span><span className="text-white">{new Date(rfq.durationEnd).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cities</span><span className="text-white">{rfq.targetCities?.join(', ') || 'All'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cinemas</span><span className="text-white">{rfq.items?.length}</span></div>
          </div>
        </div>
      </div>

      {/* RFQ Items */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white text-sm mb-3">Requested Cinemas</h3>
        <div className="space-y-2">
          {rfq.items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-cinema-border/50 last:border-0 text-sm">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-brand-400" />
                <div>
                  <span className="text-white">{item.cinema?.name}</span>
                  <span className="text-gray-500 text-xs ml-2 flex items-center gap-1 inline-flex">
                    <MapPin className="w-3 h-3" />{item.cinema?.city}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">{item.slotsRequested} slots · {item.preferredTime?.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Builder */}
      {canBuildQuote && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gold" /> Quote Builder
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            {quoteItems.map((item, i) => {
              const cinema = rfq.items?.find((ri: any) => ri.cinemaId === item.cinemaId)?.cinema
              return (
                <div key={i} className="rounded-xl border border-cinema-border bg-cinema-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-brand-400" />
                      <span className="text-white text-sm font-medium">{cinema?.name}</span>
                      <span className="text-gray-500 text-xs">{cinema?.city}</span>
                    </div>
                    <button onClick={() => removeItem(i)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Slots</label>
                      <input type="number" min="1" className="input-field py-2 text-sm"
                        value={item.slots} onChange={e => updateItem(i, 'slots', parseInt(e.target.value) || 1)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Price/Slot (₦)</label>
                      <input type="number" min="0" className="input-field py-2 text-sm"
                        value={item.pricePerSlot} onChange={e => updateItem(i, 'pricePerSlot', parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Time Slot</label>
                      <select className="input-field py-2 text-sm" value={item.timeOfDay}
                        onChange={e => updateItem(i, 'timeOfDay', e.target.value)}>
                        {['MORNING', 'AFTERNOON', 'EVENING', 'ALL_DAY'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Subtotal</label>
                      <div className="input-field py-2 text-sm font-mono text-gold bg-cinema-darker">
                        {formatCurrency(item.slots * item.pricePerSlot)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="glass-card p-5 border border-gold/20">
            <h4 className="text-sm font-semibold text-white mb-4">Quote Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Media Cost</span><span className="text-white font-mono">{formatCurrency(totalMediaCost)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Agency Fee (10%)</span><span className="text-white font-mono">{formatCurrency(agencyFee)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Ad Conversion Fee</span><span className="text-white font-mono">{formatCurrency(conversionFee)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">VAT (7.5%)</span><span className="text-white font-mono">{formatCurrency(vatAmount)}</span></div>
              <div className="flex justify-between pt-2 border-t border-cinema-border text-base font-bold">
                <span className="text-white">Grand Total</span>
                <span className="gold-text font-display text-xl">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label text-xs">Valid Until</label>
              <input type="date" className="input-field" value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="label text-xs">Notes to Advertiser</label>
              <input className="input-field" placeholder="Any notes..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button onClick={handleSendQuote} disabled={saving || totalMediaCost === 0}
              className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Quote to Advertiser</>}
            </button>
          </div>
        </div>
      )}

      {/* Existing quote */}
      {rfq.quote && !canBuildQuote && (
        <div className="glass-card p-5 border border-gold/20">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            Quote Sent · <span className={statusBadge(rfq.quote.status)}>{rfq.quote.status}</span>
          </h3>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-400">Grand Total</span>
            <span className="gold-text font-display">{formatCurrency(rfq.quote.grandTotal)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
