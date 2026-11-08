import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

// Public routes accessible without logging in (game lobby, modes, assets, and APIs)
const isPublicRoute = createRouteMatcher([
  '/',
  '/host(.*)',
  '/join(.*)',
  '/battle(.*)',
  '/adventure(.*)',
  '/survival(.*)',
  '/explore(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  try {
    return await clerkHandler(req, evt);
  } catch (error) {
    // Graceful fallback to avoid hard 500 error on edge runtimes
    console.error('Clerk middleware error fallback:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
