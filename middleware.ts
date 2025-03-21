import { clerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Use clerkMiddleware to handle authentication
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = getAuth(req);
  
  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/login', '/phone-login'];
  
  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );
  
  // If no userId is found and we're not on a public route, redirect to home
  if (!userId && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
});

// Define which routes the middleware applies to
export const config = {
  matcher: [
    // Apply to all routes except static files, API routes, and Next.js internals
    '/((?!api|_next/static|_next/image|images|favicon.ico|android-chrome-.*\\.png).*)',
  ],
};
