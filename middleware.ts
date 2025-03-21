// Simplified middleware for Vercel Edge Runtime compatibility
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a placeholder middleware that doesn't enforce authentication
// It allows all routes to be accessible without auth checks temporarily
export default function middleware(req: NextRequest) {
  // Just pass through all requests for now
  return NextResponse.next();
}

// Limit the middleware to apply only to the routes we need
export const config = {
  matcher: [
    /*
      Match all request paths except for:
      - Static files (.*, ?), 
      - _next folders (_next), 
      - api routes (api)
    */
    '/((?!_next|api|android-chrome-.*\\.png|favicon\\.ico|globals\\.css).*)'
  ],
};
