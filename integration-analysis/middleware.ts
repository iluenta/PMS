import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log all requests for debugging (remove in production)
  console.log(`[Middleware] ${request.method} ${pathname}`)

  // Handle property ID validation for dynamic routes
  if (pathname.match(/^\/[^/]+\/guide$/)) {
    const propertyId = pathname.split("/")[1]

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(propertyId)) {
      // Redirect to 404 for invalid property IDs
      return NextResponse.redirect(new URL("/not-found", request.url))
    }
  }

  // Handle admin routes - could add authentication here
  if (pathname.startsWith("/admin")) {
    // In a real app, you would check authentication here
    // For now, just allow access
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
