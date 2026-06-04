import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip server actions (POST with Next-Action header)
  if (request.headers.get('next-action')) {
    return NextResponse.next()
  }

  const role = request.cookies.get('demo_role')?.value
  const { pathname } = request.nextUrl

  if (!role && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (role && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
