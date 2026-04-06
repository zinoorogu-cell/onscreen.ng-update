'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      // Redirect based on role
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      const role = data.user?.role

      if (role === 'ADMIN') router.push('/admin/dashboard')
      else if (role === 'MEDIA_OWNER') router.push('/media-owner/dashboard')
      else router.push('/advertiser/dashboard')
    } else {
      setError(result.error || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400">Sign in to your Onscreen.ng account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-12"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 glass-card p-4 text-xs text-gray-500 space-y-1">
        <div className="text-gray-400 font-medium mb-2">Demo accounts:</div>
        <div>🔴 Admin: <span className="font-mono text-gray-400">admin@onscreen.ng / Admin@123!</span></div>
        <div>🟠 Brand: <span className="font-mono text-gray-400">brand@example.com / Demo@123!</span></div>
        <div>🟡 Owner: <span className="font-mono text-gray-400">owner@silverbird.com / Media@123!</span></div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
