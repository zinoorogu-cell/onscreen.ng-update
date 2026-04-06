'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Film, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dashboardLink =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'MEDIA_OWNER'
      ? '/media-owner/dashboard'
      : '/advertiser/dashboard'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cinema-darker/95 backdrop-blur-md border-b border-cinema-border shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="text-white">Onscreen</span>
              <span className="text-brand-500">.ng</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              How It Works
            </Link>
            <Link href="/#locations" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Locations
            </Link>
            <Link href="/#cinemas" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Partner Cinemas
            </Link>
            <Link href="/advertiser/marketplace" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Marketplace
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href={dashboardLink} className="btn-primary py-2 text-sm">
                Dashboard
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-outline py-2 text-sm">
                  Sign In
                </Link>
                <Link href="/signup" className="btn-primary py-2 text-sm">
                  Start Campaign
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-cinema-border py-4 space-y-2 animate-fade-in">
            <Link href="/#how-it-works" className="block px-4 py-2 text-gray-400 hover:text-white">How It Works</Link>
            <Link href="/#locations" className="block px-4 py-2 text-gray-400 hover:text-white">Locations</Link>
            <Link href="/#cinemas" className="block px-4 py-2 text-gray-400 hover:text-white">Partner Cinemas</Link>
            <div className="pt-2 flex flex-col gap-2 px-4">
              {user ? (
                <Link href={dashboardLink} className="btn-primary justify-center">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="btn-outline justify-center">Sign In</Link>
                  <Link href="/signup" className="btn-primary justify-center">Start Campaign</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
