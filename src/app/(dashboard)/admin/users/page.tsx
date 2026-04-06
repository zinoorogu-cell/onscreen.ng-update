'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Shield, Building2, Megaphone } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      setUsers(d.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'badge bg-red-500/20 text-red-400 border-red-500/30',
      MEDIA_OWNER: 'badge bg-purple-500/20 text-purple-400 border-purple-500/30',
      ADVERTISER: 'badge bg-brand-500/20 text-brand-400 border-brand-500/30',
    }
    return map[role] || 'badge'
  }

  const roleIcon = (role: string) => {
    if (role === 'ADMIN') return <Shield className="w-4 h-4 text-red-400" />
    if (role === 'MEDIA_OWNER') return <Building2 className="w-4 h-4 text-purple-400" />
    return <Megaphone className="w-4 h-4 text-brand-400" />
  }

  const filtered = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.company?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || u.role === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-500 text-sm mt-1">Manage platform users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 glass-card p-1">
          {['ALL', 'ADVERTISER', 'MEDIA_OWNER', 'ADMIN'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {f === 'ALL' ? 'All' : f === 'MEDIA_OWNER' ? 'Owners' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="table-header">User</th>
                <th className="table-header hidden md:table-cell">Company</th>
                <th className="table-header hidden sm:table-cell">Role</th>
                <th className="table-header hidden lg:table-cell">Joined</th>
                <th className="table-header hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-300 text-sm">{user.company || '—'}</td>
                  <td className="table-cell hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      {roleIcon(user.role)}
                      <span className={roleBadge(user.role)}>{user.role}</span>
                    </div>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="table-cell hidden sm:table-cell">
                    <span className={user.isVerified ? 'badge-active' : 'badge-pending'}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
