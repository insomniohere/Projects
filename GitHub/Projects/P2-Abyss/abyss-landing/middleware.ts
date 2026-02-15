import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/explore(.*)',
  '/artists(.*)',
  '/collections/(.*)',
  '/api/webhooks(.*)',
  '/api/search(.*)',
]);

// Define protected platform routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/upload(.*)',
  '/gallery(.*)',
  '/profile(.*)',
  '/protection(.*)',
  '/collections(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect platform routes
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
