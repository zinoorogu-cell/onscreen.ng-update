import Link from 'next/link'
import {
  Play, ArrowRight, MapPin, Users, TrendingUp, Star,
  CheckCircle, Film, Monitor, Layers, Zap, Globe, Award,
  BarChart2, Clock, Shield, ChevronRight,
} from 'lucide-react'
import { CinemaCarousel } from '@/components/landing/CinemaCarousel'
import { FilmsShowcase } from '@/components/landing/FilmsShowcase'
import { prisma } from '@/lib/prisma'

async function getCinemas() {
  try {
    return await prisma.cinema.findMany({
      where: { isActive: true, isApproved: true },
      select: { id: true, name: true, city: true, state: true, logoUrl: true },
      orderBy: { name: 'asc' },
    })
  } catch {
    return []
  }
}

const STATS = [
  { value: '12+', label: 'Partner Cinemas', icon: Film },
  { value: '8', label: 'Cities Covered', icon: MapPin },
  { value: '2M+', label: 'Monthly Impressions', icon: TrendingUp },
  { value: '50+', label: 'Brands Served', icon: Award },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Submit Your RFQ',
    description: 'Tell us your campaign goals, budget range, target cities, and preferred cinemas. No upfront payment needed.',
    icon: Layers,
  },
  {
    step: '02',
    title: 'Receive a Custom Quote',
    description: 'Our team reviews your request and builds a detailed quote with impressions estimates and pricing breakdown.',
    icon: BarChart2,
  },
  {
    step: '03',
    title: 'Accept & Pay',
    description: 'Review your quote, accept it, and complete payment securely via Paystack. Clear fee breakdown with VAT.',
    icon: Shield,
  },
  {
    step: '04',
    title: 'Campaign Goes Live',
    description: 'Your ad runs across selected cinemas. Track impressions, plays, and reach in real-time from your dashboard.',
    icon: Zap,
  },
]

const WHY_CINEMA = [
  {
    title: 'Captive Audience',
    description: 'Cinema-goers are seated and focused — no scrolling, no skipping. Your ad commands 100% attention.',
    icon: Users,
  },
  {
    title: 'Premium Context',
    description: 'Brands shown in cinema are perceived as premium. Ride the emotional wave of the big-screen experience.',
    icon: Star,
  },
  {
    title: 'Measurable Reach',
    description: 'Dynamic occupancy tracking gives you accurate impression counts based on real attendance data.',
    icon: TrendingUp,
  },
  {
    title: 'Targeted Locations',
    description: 'Choose specific cinemas in Lagos, Abuja, PH and across Africa to reach your exact demographic.',
    icon: MapPin,
  },
  {
    title: 'Multi-format Support',
    description: 'Run video ads (MP4), still images, or even YouTube/Vimeo links. Full creative flexibility.',
    icon: Monitor,
  },
  {
    title: 'Live Analytics',
    description: 'Real-time campaign dashboard with impressions over time, play counts, and location-level data.',
    icon: BarChart2,
  },
]

const LOCATIONS = [
  { city: 'Lagos', screens: '20+', cinemas: 5, flag: '🏙️', highlight: true },
  { city: 'Abuja', screens: '12+', cinemas: 3, flag: '🏛️', highlight: false },
  { city: 'Port Harcourt', screens: '8+', cinemas: 2, flag: '⚓', highlight: false },
  { city: 'Ibadan', screens: '6+', cinemas: 2, flag: '🌿', highlight: false },
  { city: 'Kano', screens: '5+', cinemas: 1, flag: '🌙', highlight: false },
  { city: 'Enugu', screens: '4+', cinemas: 1, flag: '⛏️', highlight: false },
  { city: 'Nairobi', screens: '8+', cinemas: 1, flag: '🦁', highlight: false },
  { city: 'Accra', screens: '6+', cinemas: 1, flag: '🌍', highlight: false },
]

export default async function LandingPage() {
  const cinemas = await getCinemas()

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-cinema-darker">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600/20 border border-brand-600/40 rounded-full text-brand-400 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            Nigeria's Premier Cinema Ad Marketplace
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 animate-slide-up">
            <span className="text-white">Your Brand</span>
            <br />
            <span className="gold-text">On The Big Screen</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in">
            The premium marketplace for cinema and outdoor advertising across Nigeria and Africa.
            Submit an RFQ and get in front of millions of engaged viewers.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
            <Link href="/signup" className="btn-gold text-base px-8 py-4">
              Start Your Campaign
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/#how-it-works" className="btn-outline text-base px-8 py-4">
              <Play className="w-4 h-4" />
              How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className="text-2xl md:text-3xl font-display font-bold gold-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* CINEMA CAROUSEL */}
      <section id="cinemas" className="py-20 overflow-hidden border-y border-cinema-border bg-cinema-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title mb-2">
                <span className="text-white">Partner </span>
                <span className="orange-text">Cinemas</span>
              </h2>
              <p className="text-gray-500">Premium cinema locations across Nigeria and Africa</p>
            </div>
            <Link href="/advertiser/marketplace" className="hidden md:flex btn-outline text-sm py-2">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <CinemaCarousel cinemas={cinemas} />
      </section>

      {/* NOW SHOWING / COMING SOON */}
      <FilmsShowcase />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              <span className="text-white">How </span>
              <span className="gold-text">It Works</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From request to campaign live in 4 simple steps. Our managed service handles everything.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-cinema-border to-transparent z-0" />
                )}
                <div className="glass-card p-6 relative z-10 h-full card-hover">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-5 h-5 text-brand-400" />
                    </div>
                    <span className="font-mono text-3xl font-bold text-cinema-border">{step.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CINEMA */}
      <section className="py-24 bg-cinema-dark/50 border-y border-cinema-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              <span className="text-white">Why Cinema </span>
              <span className="orange-text">Advertising?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Cinema delivers what digital can't — 100% attention in a distraction-free environment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CINEMA.map((item) => (
              <div key={item.title} className="glass-card p-6 group card-hover">
                <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <item.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              <span className="text-white">Our </span>
              <span className="gold-text">Locations</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Reach audiences in Nigeria's major cities and beyond across Africa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LOCATIONS.map((loc) => (
              <div
                key={loc.city}
                className={`glass-card p-5 card-hover ${loc.highlight ? 'border-brand-600/50 glow-orange' : ''}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{loc.flag}</span>
                  <div>
                    <div className="font-semibold text-white">{loc.city}</div>
                    {loc.highlight && (
                      <span className="badge-active text-xs">Most Popular</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{loc.cinemas} cinemas</span>
                  <span>{loc.screens} screens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TRANSPARENCY */}
      <section className="py-24 bg-cinema-dark/50 border-y border-cinema-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">
              <span className="text-white">Transparent </span>
              <span className="orange-text">Pricing</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              No hidden fees. Every quote shows a complete breakdown.
            </p>
          </div>

          <div className="glass-card p-8">
            <div className="space-y-4">
              {[
                { label: 'Media Cost', desc: 'Based on cinema, slots, and duration', note: 'Variable' },
                { label: 'Agency Fee', desc: '10% of media cost — platform service fee', note: '+10%' },
                { label: 'Ad Conversion Fee', desc: 'Fixed fee for creative processing & delivery', note: '+₦20,000' },
                { label: 'VAT', desc: '7.5% applied on (media + agency + conversion fee)', note: '+7.5%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-cinema-border last:border-0">
                  <div>
                    <div className="text-white font-medium">{item.label}</div>
                    <div className="text-gray-500 text-sm">{item.desc}</div>
                  </div>
                  <div className="text-brand-400 font-mono font-semibold">{item.note}</div>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between">
                <div className="font-display font-bold text-xl text-white">Grand Total</div>
                <div className="font-display font-bold text-xl gold-text">All-inclusive</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-radial from-brand-600/20 via-transparent to-transparent" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Put Your Brand{' '}
            <span className="gold-text">On The Big Screen?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join leading brands advertising across Nigeria's premium cinema network. Submit your RFQ today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-gold text-lg px-10 py-5">
              Start Your Campaign
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-outline text-lg px-10 py-5">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-cinema-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg">
                  <span className="text-white">Onscreen</span>
                  <span className="text-brand-500">.ng</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                The premium cinema advertising marketplace for Nigeria and Africa.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/advertiser/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/#locations" className="hover:text-white transition-colors">Locations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Brands</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/advertiser/rfq/new" className="hover:text-white transition-colors">Request a Quote</Link></li>
                <li><Link href="/advertiser/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Media Owners</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/signup?role=MEDIA_OWNER" className="hover:text-white transition-colors">List Inventory</Link></li>
                <li><Link href="/media-owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cinema-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div>© 2025 Onscreen.ng. All rights reserved.</div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>Nigeria · Kenya · Ghana · Across Africa</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
