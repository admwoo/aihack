import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const AUTH_PAGES = ['/login', '/register']

export async function middleware(request) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // Create a Supabase client that can read/write cookies on the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  // Refresh the session if it exists (keeps the cookie fresh)
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage  = AUTH_PAGES.some((p) => pathname.startsWith(p))

  // Already logged in trying to access login/register → send to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/quiz/:path*', '/login', '/register'],
}
