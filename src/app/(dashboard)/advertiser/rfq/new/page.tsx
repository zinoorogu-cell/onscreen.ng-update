'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Upload, Link2, X, ChevronRight, ChevronLeft, Loader2, Film, MapPin, CheckCircle, ArrowRight } from 'lucide-react'

const STEPS = ['Campaign Info', 'Select Cinemas', 'Ad Creative', 'Review & Submit']

const TIME_SLOTS = [
  { value: 'MORNING', label: 'Morning', desc: '8am - 12pm', icon: '🌅' },
  { value: 'AFTERNOON', label: 'Afternoon', desc: '12pm - 5pm', icon: '☀️' },
  { value: 'EVENING', label: 'Evening', desc: '5pm - 11pm', icon: '🌆' },
  { value: 'ALL_DAY', label: 'All Day', desc: 'Full day', icon: '⏰' },
]

export default function NewRFQPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cinemas, setCinemas] = useState<any[]>([])
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    campaignName: '',
    brandName: '',
    contactEmail: '',
    phone: '',
    durationStart: '',
    durationEnd: '',
    targetCities: [] as string[],
    notes: '',
    selectedCinemas: [] as { cinemaId: string; slotsRequested: number; preferredTime: string[] }[],
    adType: 'upload' as 'upload' | 'link',
    adLink: '',
    adFile: null as File | null,
  })

  useEffect(() => {
    fetch('/api/cinemas')
      .then(r => r.json())
      .then(d => setCinemas(d.data || []))
  }, [])

  const cities = [...new Set(cinemas.map((c: any) => c.city))]

  const toggleCity = (city: string) => {
    setForm(f => ({
      ...f,
      targetCities: f.targetCities.includes(city)
        ? f.targetCities.filter(c => c !== city)
        : [...f.targetCities, city],
    }))
  }

  const toggleCinema = (cinemaId: string) => {
    setForm(f => {
      const exists = f.selectedCinemas.find(c => c.cinemaId === cinemaId)
      if (exists) {
        return { ...f, selectedCinemas: f.selectedCinemas.filter(c => c.cinemaId !== cinemaId) }
      }
      return {
        ...f,
        selectedCinemas: [...f.selectedCinemas, { cinemaId, slotsRequested: 1, preferredTime: ['EVENING'] }],
      }
    })
  }

  const updateCinemaSlots = (cinemaId: string, field: string, value: any) => {
    setForm(f => ({
      ...f,
      selectedCinemas: f.selectedCinemas.map(c =>
        c.cinemaId === cinemaId ? { ...c, [field]: value } : c
      ),
    }))
  }

  const toggleTimeSlot = (cinemaId: string, slot: string) => {
    setForm(f => ({
      ...f,
      selectedCinemas: f.selectedCinemas.map(c => {
        if (c.cinemaId !== cinemaId) return c
        const has = c.preferredTime.includes(slot)
        return {
          ...c,
          preferredTime: has
            ? c.preferredTime.filter(s => s !== slot)
            : [...c.preferredTime, slot],
        }
      }),
    }))
  }

  const canProceed = () => {
    if (step === 0) return form.campaignName && form.brandName && form.durationStart && form.durationEnd
    if (step === 1) return form.selectedCinemas.length > 0
    if (step === 2) return form.adType === 'link' ? !!form.adLink : true
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      let adUrl = ''
      if (form.adFile) {
        // In production, upload to S3 first
        adUrl = URL.createObjectURL(form.adFile)
      }

      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: form.campaignName,
          brandName: form.brandName,
          contactEmail: form.contactEmail,
          phone: form.phone,
          durationStart: form.durationStart,
          durationEnd: form.durationEnd,
          targetCities: form.targetCities,
          notes: form.notes,
          items: form.selectedCinemas,
          adCreativeUrl: adUrl || undefined,
          adCreativeLink: form.adType === 'link' ? form.adLink : undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/advertiser/rfq/${data.data.id}?submitted=true`)
      } else {
        setError(data.error || 'Failed to submit RFQ')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  const filteredCinemas = form.targetCities.length > 0
    ? cinemas.filter((c: any) => form.targetCities.includes(c.city))
    : cinemas

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-1">New Advertising Request</h1>
        <p className="text-gray-500 text-sm">Submit an RFQ and our team will send you a custom quote</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i < step ? 'cursor-pointer' : ''}`}
              onClick={() => i < step && setStep(i)}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-brand-600 text-white' :
                'bg-cinema-muted text-gray-500'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px w-8 ${i < step ? 'bg-green-500/50' : 'bg-cinema-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-6 sm:p-8">
        {/* STEP 0: Campaign Info */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-semibold text-white text-lg mb-4">Campaign Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Campaign Name *</label>
                <input className="input-field" placeholder="e.g. Dangote Q2 2025 Launch"
                  value={form.campaignName} onChange={e => setForm(f => ({ ...f, campaignName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Brand Name *</label>
                <input className="input-field" placeholder="Your brand or company name"
                  value={form.brandName} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Contact Email</label>
                <input type="email" className="input-field" placeholder="campaign@company.com"
                  value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input-field" placeholder="+234 800 000 0000"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Campaign Start Date *</label>
                <input type="date" className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.durationStart} onChange={e => setForm(f => ({ ...f, durationStart: e.target.value }))} />
              </div>
              <div>
                <label className="label">Campaign End Date *</label>
                <input type="date" className="input-field"
                  min={form.durationStart || new Date().toISOString().split('T')[0]}
                  value={form.durationEnd} onChange={e => setForm(f => ({ ...f, durationEnd: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Target Cities</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {cities.map(city => (
                  <button key={city} type="button"
                    onClick={() => toggleCity(city)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      form.targetCities.includes(city)
                        ? 'border-brand-500 bg-brand-600/20 text-white'
                        : 'border-cinema-border bg-cinema-card text-gray-400 hover:border-cinema-muted'
                    }`}>
                    <MapPin className="w-3 h-3 inline mr-1" />{city}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">Leave empty to show cinemas from all cities</p>
            </div>

            <div>
              <label className="label">Additional Notes</label>
              <textarea className="input-field resize-none" rows={3}
                placeholder="Any specific requirements, target audience, or other details..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        )}

        {/* STEP 1: Cinema Selection */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white text-lg">Select Cinemas</h2>
              <span className="badge-active">{form.selectedCinemas.length} selected</span>
            </div>

            <div className="space-y-3">
              {filteredCinemas.map((cinema: any) => {
                const sel = form.selectedCinemas.find(c => c.cinemaId === cinema.id)
                const isSelected = !!sel

                return (
                  <div key={cinema.id} className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isSelected ? 'border-brand-500 bg-brand-600/10' : 'border-cinema-border bg-cinema-card hover:border-cinema-muted'
                  }`}>
                    {/* Cinema header */}
                    <button type="button" onClick={() => toggleCinema(cinema.id)}
                      className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cinema-darker border border-cinema-border flex items-center justify-center">
                          <Film className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{cinema.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{cinema.city}, {cinema.state}
                          </div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-600'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </button>

                    {/* Cinema config when selected */}
                    {isSelected && sel && (
                      <div className="px-4 pb-4 border-t border-cinema-border/50 pt-3 space-y-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-gray-400 w-24 flex-shrink-0">Ad Slots</label>
                          <div className="flex items-center gap-2">
                            <button type="button"
                              onClick={() => updateCinemaSlots(cinema.id, 'slotsRequested', Math.max(1, sel.slotsRequested - 1))}
                              className="w-7 h-7 rounded-lg bg-cinema-muted flex items-center justify-center hover:bg-cinema-border transition-colors">
                              <Minus className="w-3 h-3 text-white" />
                            </button>
                            <span className="w-8 text-center text-white text-sm font-mono">{sel.slotsRequested}</span>
                            <button type="button"
                              onClick={() => updateCinemaSlots(cinema.id, 'slotsRequested', sel.slotsRequested + 1)}
                              className="w-7 h-7 rounded-lg bg-cinema-muted flex items-center justify-center hover:bg-cinema-border transition-colors">
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-2">Preferred Time Slots</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {TIME_SLOTS.map(ts => (
                              <button key={ts.value} type="button"
                                onClick={() => toggleTimeSlot(cinema.id, ts.value)}
                                className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${
                                  sel.preferredTime.includes(ts.value)
                                    ? 'border-brand-500 bg-brand-600/20 text-white'
                                    : 'border-cinema-border text-gray-500 hover:border-cinema-muted'
                                }`}>
                                <span>{ts.icon}</span> {ts.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {filteredCinemas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Film className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p>No cinemas found for selected cities</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Ad Creative */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-semibold text-white text-lg mb-4">Ad Creative</h2>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'upload', label: 'Upload File', icon: Upload, desc: 'MP4, JPG, PNG' },
                { value: 'link', label: 'External Link', icon: Link2, desc: 'YouTube, Vimeo, Drive' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, adType: opt.value as any }))}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${
                    form.adType === opt.value
                      ? 'border-brand-500 bg-brand-600/20 text-white'
                      : 'border-cinema-border bg-cinema-card text-gray-400'
                  }`}>
                  <opt.icon className="w-6 h-6" />
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs opacity-60">{opt.desc}</span>
                </button>
              ))}
            </div>

            {form.adType === 'upload' ? (
              <div>
                <label className="block">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    form.adFile ? 'border-brand-500 bg-brand-600/10' : 'border-cinema-border hover:border-cinema-muted'
                  }`}>
                    {form.adFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-white text-sm font-medium">{form.adFile.name}</div>
                          <div className="text-gray-500 text-xs">{(form.adFile.size / 1024 / 1024).toFixed(1)} MB</div>
                        </div>
                        <button type="button" onClick={e => { e.preventDefault(); setForm(f => ({ ...f, adFile: null })) }}>
                          <X className="w-4 h-4 text-gray-500 hover:text-white" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                        <div className="text-gray-400 text-sm">Drop your file here, or <span className="text-brand-400">browse</span></div>
                        <div className="text-gray-600 text-xs mt-1">MP4, MOV, JPG, PNG · Max 500MB</div>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="video/*,image/*"
                    onChange={e => { if (e.target.files?.[0]) setForm(f => ({ ...f, adFile: e.target.files![0] })) }} />
                </label>
              </div>
            ) : (
              <div>
                <label className="label">Ad Creative URL</label>
                <input className="input-field" type="url"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  value={form.adLink} onChange={e => setForm(f => ({ ...f, adLink: e.target.value }))} />
                <p className="text-xs text-gray-600 mt-2">Supported: YouTube, Vimeo, Google Drive, CDN links</p>
              </div>
            )}

            <div className="glass-card p-4 border-l-4 border-l-yellow-500/50">
              <p className="text-xs text-gray-400">
                <span className="text-yellow-400 font-medium">Note:</span> You can also submit your RFQ without a creative and upload it later after receiving your quote.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-semibold text-white text-lg mb-4">Review & Submit</h2>

            <div className="space-y-4">
              <div className="glass-card p-4 space-y-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Campaign Details</div>
                {[
                  { label: 'Campaign', value: form.campaignName },
                  { label: 'Brand', value: form.brandName },
                  { label: 'Duration', value: `${form.durationStart} → ${form.durationEnd}` },
                  { label: 'Cities', value: form.targetCities.join(', ') || 'All cities' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="glass-card p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Selected Cinemas ({form.selectedCinemas.length})</div>
                <div className="space-y-2">
                  {form.selectedCinemas.map(sc => {
                    const cinema = cinemas.find((c: any) => c.id === sc.cinemaId)
                    return (
                      <div key={sc.cinemaId} className="flex justify-between text-sm">
                        <span className="text-white">{cinema?.name}</span>
                        <span className="text-gray-500">{sc.slotsRequested} slot{sc.slotsRequested > 1 ? 's' : ''} · {sc.preferredTime.join(', ')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="glass-card p-4 border border-brand-600/30">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">What happens next?</div>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />Our team reviews your request within 24hrs</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />You'll receive a detailed quote with impressions estimates</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />Accept the quote and pay via Paystack to activate your campaign</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-cinema-border">
          <button type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed py-2.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed py-2.5">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn-gold py-2.5 px-8">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit RFQ <ArrowRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
