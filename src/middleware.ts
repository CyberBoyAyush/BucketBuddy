import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session cookie to check if user is authenticated
  const sessionCookie = getSessionCookie(request);
  
  // Define protected routes
  const protectedRoutes = ["/dashboard", "/buckets", "/settings"];
  const authRoutes = ["/login", "/signup"];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!sessionCookie && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Add the original URL as a redirect parameter
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
