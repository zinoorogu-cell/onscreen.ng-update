'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Film, LayoutDashboard, FileText, BarChart2, MapPin,
  Settings, LogOut, Menu, X, Bell, ChevronDown,
  Building2, Users, Megaphone, DollarSign, Package, Clapperboard, CalendarDays,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const ADVERTISER_LINKS = [
  { href: '/advertiser/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/advertiser/rfq/new', icon: FileText, label: 'New RFQ' },
  { href: '/advertiser/rfq', icon: Megaphone, label: 'My Requests' },
  { href: '/advertiser/campaigns', icon: BarChart2, label: 'Campaigns' },
  { href: '/advertiser/marketplace', icon: MapPin, label: 'Marketplace' },
  { href: '/advertiser/schedule', icon: CalendarDays, label: "What's On" },
]

const ADMIN_LINKS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/rfq', icon: FileText, label: 'RFQ Requests' },
  { href: '/admin/quotes', icon: DollarSign, label: 'Quotes' },
  { href: '/admin/campaigns', icon: BarChart2, label: 'Campaigns' },
  { href: '/admin/cinemas', icon: Building2, label: 'Cinemas' },
  { href: '/admin/films', icon: Clapperboard, label: 'Film Programme' },
  { href: '/admin/users', icon: Users, label: 'Users' },
]

const MEDIA_OWNER_LINKS = [
  { href: '/media-owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/media-owner/inventory', icon: Package, label: 'My Inventory' },
  { href: '/media-owner/bookings', icon: FileText, label: 'Bookings' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const links =
    user.role === 'ADMIN'
      ? ADMIN_LINKS
      : user.role === 'MEDIA_OWNER'
      ? MEDIA_OWNER_LINKS
      : ADVERTISER_LINKS

  const roleLabel =
    user.role === 'ADMIN' ? 'Admin Panel' :
    user.role === 'MEDIA_OWNER' ? 'Media Owner' : 'Advertiser'

  const roleBadgeClass =
    user.role === 'ADMIN' ? 'badge bg-red-500/20 text-red-400 border-red-500/30' :
    user.role === 'MEDIA_OWNER' ? 'badge bg-purple-500/20 text-purple-400 border-purple-500/30' :
    'badge bg-brand-500/20 text-brand-400 border-brand-500/30'

  return (
    <div className="min-h-screen bg-cinema-darker flex">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-cinema-dark border-r border-cinema-border flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-cinema-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">
              <span className="text-white">Onscreen</span>
              <span className="text-brand-500">.ng</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-cinema-border">
          <span className={roleBadgeClass}>{roleLabel}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${pathname === link.href || pathname.startsWith(link.href + '/') ? 'active' : ''}`}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-cinema-border space-y-1">
          <Link href="/settings" className="sidebar-link text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={logout}
            className="sidebar-link w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-cinema-darker/90 backdrop-blur-md border-b border-cinema-border">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 lg:flex-none" />

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
              </button>

              <div className="flex items-center gap-2 glass-card px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-white leading-none mb-0.5">{user.name}</div>
                  <div className="text-xs text-gray-500 leading-none">{user.company || user.email}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:block" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
