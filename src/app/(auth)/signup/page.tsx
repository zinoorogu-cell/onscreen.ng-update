'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function SignupForm() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'ADVERTISER'

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: defaultRole, company: '', phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const result = await signup(form)

    if (result.success) {
      if (form.role === 'ADMIN') router.push('/admin/dashboard')
      else if (form.role === 'MEDIA_OWNER') router.push('/media-owner/dashboard')
      else router.push('/advertiser/dashboard')
    } else {
      setError(result.error || 'Signup failed')
    }
    setLoading(false)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-gray-400">Start advertising on Nigeria's premier cinema network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="label">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'ADVERTISER', label: 'Brand / Agency' },
              { value: 'MEDIA_OWNER', label: 'Cinema / Media Owner' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('role', opt.value)}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  form.role === opt.value
                    ? 'border-brand-500 bg-brand-600/20 text-white'
                    : 'border-cinema-border bg-cinema-card text-gray-400 hover:border-cinema-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input-field" placeholder="John Doe" value={form.name}
              onChange={e => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input-field" placeholder="Company name" value={form.company}
              onChange={e => update('company', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Email address</label>
          <input type="email" className="input-field" placeholder="you@company.com" value={form.email}
            onChange={e => update('email', e.target.value)} required />
        </div>

        <div>
          <label className="label">Phone number</label>
          <input type="tel" className="input-field" placeholder="+234 800 000 0000" value={form.phone}
            onChange={e => update('phone', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className="input-field pr-10"
                placeholder="••••••••" value={form.password}
                onChange={e => update('password', e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm</label>
            <input type="password" className="input-field" placeholder="••••••••" value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)} required />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
          ) : (
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96" />}>
      <SignupForm />
    </Suspense>
  )
}
