import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Onscreen.ng — Cinema & Outdoor Advertising Marketplace',
  description: 'The premium ad-tech marketplace for cinema and outdoor advertising in Nigeria and across Africa. Discover, book, and track advertising campaigns.',
  keywords: 'cinema advertising, Nigeria, Africa, outdoor advertising, ad-tech, marketplace',
  openGraph: {
    title: 'Onscreen.ng — Cinema & Outdoor Advertising',
    description: 'Premium ad-tech marketplace for cinema and outdoor advertising in Nigeria and Africa.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-body bg-cinema-darker text-white antialiased">
        {children}
      </body>
    </html>
  )
}
