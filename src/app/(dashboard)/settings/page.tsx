'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Save, Loader2, User, Lock, Bell } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === t.id ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-cinema-border">
            <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold">{user?.name}</div>
              <div className="text-gray-500 text-sm">{user?.email}</div>
              <span className="badge bg-brand-500/20 text-brand-400 border-brand-500/30 text-xs mt-1">{user?.role}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input-field" value={profile.company}
                onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input-field" value={user?.email || ''} disabled
                className="input-field opacity-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input-field" value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn-primary py-2.5">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> :
             saved ? '✓ Saved!' :
             <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-semibold text-white">Change Password</h3>
          <div className="space-y-4">
            <div><label className="label">Current Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
            <div><label className="label">New Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
            <div><label className="label">Confirm New Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
          </div>
          <button className="btn-primary py-2.5"><Save className="w-4 h-4" /> Update Password</button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white mb-2">Notification Preferences</h3>
          {[
            { label: 'Quote received', desc: 'When admin sends a quote for your RFQ' },
            { label: 'Campaign activated', desc: 'When your campaign goes live' },
            { label: 'Campaign completed', desc: 'When your campaign ends' },
            { label: 'Weekly reports', desc: 'Weekly impression summary emails' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-cinema-border last:border-0">
              <div>
                <div className="text-white text-sm font-medium">{item.label}</div>
                <div className="text-gray-500 text-xs">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-cinema-muted rounded-full peer peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
