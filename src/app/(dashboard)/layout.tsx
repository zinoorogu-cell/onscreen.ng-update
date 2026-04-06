import { Providers } from '@/components/providers'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <DashboardLayout>{children}</DashboardLayout>
    </Providers>
  )
}
