import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware implements basic auth checking without using Clerk's complex edge incompatible features
export default function middleware(req: NextRequest) {
  // Extract the token from the cookie if it exists
  const token = req.cookies.get('__session')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/sign-in',
    '/sign-up',
    '/phone-login',
    '/sso-callback'
  ];

  // Static assets and API routes that should bypass middleware
  const bypassRoutes = [
    '/favicon.ico',
    '/manifest.json',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/globals.css',
    '/_next',
    '/api'
  ];

  const path = req.nextUrl.pathname;
  
  // Check if the current path should bypass middleware entirely
  if (bypassRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
  
  // If it's not a public route and no token exists, redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
