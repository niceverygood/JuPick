import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isAuthApi = req.nextUrl.pathname.startsWith("/api/auth")

  // Allow auth API routes
  if (isAuthApi) {
    return NextResponse.next()
  }

  // Redirect logged in users away from login page
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Allow login page for non-logged in users
  if (isAuthPage) {
    return NextResponse.next()
  }

  // Protect API routes
  if (isApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Protect dashboard routes
  if (!isLoggedIn && !isAuthPage) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

