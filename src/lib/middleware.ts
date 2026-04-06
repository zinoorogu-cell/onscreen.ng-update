import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from './auth'

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, session: { userId: string; email: string; role: string; name: string }) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  const session = await getSessionFromRequest(req)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return handler(req, session)
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}
