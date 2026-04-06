import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './src/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/cinemas']
  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith('/api/auth/'))

  if (isPublic) return NextResponse.next()

  // Protected routes
  const isDashboard = pathname.startsWith('/advertiser') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/media-owner')

  if (isDashboard || pathname.startsWith('/api/')) {
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based routing
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/advertiser/dashboard', req.url))
    }

    if (pathname.startsWith('/media-owner') && payload.role !== 'MEDIA_OWNER' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/advertiser/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
