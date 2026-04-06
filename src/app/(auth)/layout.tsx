import Link from 'next/link'
import { Film } from 'lucide-react'
import { Providers } from '@/components/providers'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-cinema-darker flex">
        {/* Left panel - branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-cinema-gradient">
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl">
                <span className="text-white">Onscreen</span>
                <span className="text-brand-500">.ng</span>
              </span>
            </Link>

            <div>
              <blockquote className="font-display text-4xl font-bold text-white leading-tight mb-6">
                "Your brand deserves{' '}
                <span className="gold-text">the big screen</span>"
              </blockquote>
              <p className="text-gray-400 text-lg max-w-sm">
                Nigeria's premier cinema advertising marketplace. Reach millions of engaged viewers.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {['Lagos', 'Abuja', 'Port Harcourt', 'Nairobi', 'Accra'].map((city) => (
                <span key={city} className="glass-card px-3 py-1.5 text-xs text-gray-400">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-xl">
                  <span className="text-white">Onscreen</span>
                  <span className="text-brand-500">.ng</span>
                </span>
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </Providers>
  )
}
