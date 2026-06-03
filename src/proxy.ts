import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // DEMO MODE: auth check o'chirilgan
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
