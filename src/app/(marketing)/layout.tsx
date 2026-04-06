import { Providers } from '@/components/providers'
import { MarketingNav } from '@/components/landing/MarketingNav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <MarketingNav />
      {children}
    </Providers>
  )
}
