import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Function to add security headers
function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // More specific CSP configuration
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev",
    "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev",
    "style-src 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev",
    "img-src 'self' data: blob: https://*.clerk.com https://*.clerk.accounts.dev",
    "font-src 'self' data: https://*.clerk.com https://*.clerk.accounts.dev",
    "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.supabase.co https://clerk-telemetry.com",
    "worker-src 'self' blob:",
  ].join("; ");
  
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/sign-up", "/phone-login", "/forgot-password"];

// Export the Clerk middleware with security headers
export default clerkMiddleware(async (auth, req) => {
  // Apply security headers to the response
  const response = addSecurityHeaders(NextResponse.next());
  
  // Get auth status
  const session = await auth();
  const { userId } = session;
  
  // Parse URL to get pathname
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(path);
  
  // Handle users who aren't authenticated
  if (!userId && !isPublicRoute) {
    return addSecurityHeaders(NextResponse.redirect(new URL('/login', req.url)));
  }
  
  // If the user is logged in and trying to access a public route, redirect them to the dashboard
  if (userId && isPublicRoute && path !== "/") {
    return addSecurityHeaders(NextResponse.redirect(new URL('/dashboard', req.url)));
  }
  
  // Allow access to protected routes for authenticated users and public routes for everyone
  return response;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 