'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Film, Calendar, MapPin, DollarSign, Info, ExternalLink, Loader2, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/impressions'

export default function RFQDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justSubmitted = searchParams.get('submitted') === 'true'
  const [rfq, setRfq] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/rfq/${id}`).then(r => r.json()).then(d => {
      setRfq(d.data)
      setLoading(false)
    })
  }, [id])

  const handleQuoteAction = async (action: 'accept' | 'reject') => {
    if (!rfq?.quote?.id) return
    setActionLoading(true)
    const res = await fetch(`/api/quotes/${rfq.quote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    if (data.success) {
      if (action === 'accept') {
        router.push(`/advertiser/campaigns`)
      } else {
        setRfq((r: any) => ({ ...r, status: 'REJECTED', quote: { ...r.quote, status: 'REJECTED' } }))
      }
    }
    setActionLoading(false)
  }

  const handlePaystack = () => {
    if (typeof window !== 'undefined' && rfq?.quote) {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => {
        const handler = (window as any).PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_demo',
          email: rfq.user?.email,
          amount: Math.round(rfq.quote.grandTotal * 100),
          currency: 'NGN',
          ref: `OSC-${Date.now()}`,
          callback: (response: any) => {
            fetch(`/api/payments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quoteId: rfq.quote.id, reference: response.reference }),
            })
            router.push('/advertiser/campaigns')
          },
        })
        handler.openIframe()
      }
      document.body.appendChild(script)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', QUOTED: 'badge-quoted', ACCEPTED: 'badge-accepted',
      REJECTED: 'badge-rejected', SENT: 'badge-sent',
    }
    return map[status] || 'badge'
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!rfq) return <div className="text-center text-gray-500 py-20">RFQ not found</div>

  const quote = rfq.quote

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      {justSubmitted && (
        <div className="glass-card border border-green-500/40 bg-green-500/10 p-5 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-green-300 font-semibold">RFQ Submitted Successfully!</div>
            <div className="text-green-400/70 text-sm mt-1">Our team will review your request and send a quote within 24 hours.</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href="/advertiser/rfq" className="p-2 glass-card hover:border-cinema-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-white">{rfq.campaignName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={statusBadge(rfq.status)}>{rfq.status}</span>
            <span className="text-gray-500 text-xs">Submitted {new Date(rfq.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Campaign details */}
      <div className="glass-card p-5 space-y-4">
        <h2 className="font-semibold text-white">Campaign Details</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Brand', value: rfq.brandName },
            { label: 'Contact Email', value: rfq.contactEmail },
            { label: 'Phone', value: rfq.phone },
            { label: 'Cities', value: rfq.targetCities?.join(', ') || '—' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-gray-500 text-xs mb-1">{item.label}</div>
              <div className="text-white">{item.value}</div>
            </div>
          ))}
          <div>
            <div className="text-gray-500 text-xs mb-1">Campaign Duration</div>
            <div className="text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              {new Date(rfq.durationStart).toLocaleDateString()} → {new Date(rfq.durationEnd).toLocaleDateString()}
            </div>
          </div>
        </div>
        {rfq.notes && (
          <div>
            <div className="text-gray-500 text-xs mb-1">Notes</div>
            <div className="text-gray-300 text-sm">{rfq.notes}</div>
          </div>
        )}
      </div>

      {/* Selected Cinemas */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-white mb-4">Selected Cinemas ({rfq.items?.length})</h2>
        <div className="space-y-3">
          {rfq.items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-cinema-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4 text-brand-400" />
                <div>
                  <div className="text-sm text-white">{item.cinema?.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{item.cinema?.city}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{item.slotsRequested} slot{item.slotsRequested > 1 ? 's' : ''}</div>
                <div>{item.preferredTime?.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Creatives */}
      {rfq.adCreatives?.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-3">Ad Creative</h2>
          {rfq.adCreatives.map((ac: any) => (
            <div key={ac.id} className="flex items-center gap-3 text-sm">
              {ac.externalLink ? (
                <><ExternalLink className="w-4 h-4 text-brand-400" />
                <a href={ac.externalLink} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 truncate">{ac.externalLink}</a></>
              ) : (
                <><Film className="w-4 h-4 text-brand-400" /><span className="text-gray-300">{ac.fileName || 'Uploaded file'}</span></>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QUOTE section */}
      {quote && (
        <div className={`glass-card p-5 ${quote.status === 'SENT' || quote.status === 'ACCEPTED' ? 'border-gold/40' : ''}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold" />
              Quote Breakdown
            </h2>
            <span className={statusBadge(quote.status)}>{quote.status}</span>
          </div>

          {/* Quote items */}
          <div className="space-y-2 mb-5">
            {quote.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm py-1.5">
                <div>
                  <div className="text-white">{item.cinema?.name}</div>
                  <div className="text-xs text-gray-500">{item.slots} slot{item.slots > 1 ? 's' : ''} × {formatCurrency(item.pricePerSlot)}</div>
                </div>
                <div className="text-white font-mono">{formatCurrency(item.subtotal)}</div>
              </div>
            ))}
          </div>

          {/* Fee breakdown */}
          <div className="border-t border-cinema-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Media Cost</span>
              <span className="text-white font-mono">{formatCurrency(quote.totalMediaCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Agency Fee (10%)</span>
              <span className="text-white font-mono">{formatCurrency(quote.agencyFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                Ad Conversion Fee <Info className="w-3 h-3" />
              </span>
              <span className="text-white font-mono">{formatCurrency(quote.conversionFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">VAT (7.5%)</span>
              <span className="text-white font-mono">{formatCurrency(quote.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-cinema-border">
              <span className="text-white">Grand Total</span>
              <span className="gold-text font-display text-xl font-bold">{formatCurrency(quote.grandTotal)}</span>
            </div>
          </div>

          {/* Actions */}
          {quote.status === 'SENT' && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-cinema-border">
              <button onClick={() => handleQuoteAction('reject')} disabled={actionLoading}
                className="btn-outline flex-1 justify-center border-red-500/50 text-red-400 hover:bg-red-500/10">
                <XCircle className="w-4 h-4" /> Reject Quote
              </button>
              <button onClick={() => handleQuoteAction('accept')} disabled={actionLoading}
                className="btn-gold flex-1 justify-center">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Accept Quote
              </button>
            </div>
          )}

          {quote.status === 'ACCEPTED' && !quote.payment && (
            <div className="mt-6 pt-4 border-t border-cinema-border">
              <button onClick={handlePaystack} className="btn-gold w-full justify-center py-4">
                <CreditCard className="w-5 h-5" />
                Pay {formatCurrency(quote.grandTotal)} via Paystack
              </button>
            </div>
          )}

          {quote.payment?.status === 'PAID' && (
            <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Payment received · Campaign is being activated
            </div>
          )}
        </div>
      )}

      {rfq.status === 'PENDING' && !quote && (
        <div className="glass-card p-5 border border-yellow-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="text-white font-medium text-sm">Awaiting Quote</div>
            <div className="text-gray-500 text-xs mt-0.5">Our team is reviewing your request. You'll be notified when your quote is ready.</div>
          </div>
        </div>
      )}
    </div>
  )
}
