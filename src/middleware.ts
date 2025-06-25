import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/chat-path',
  '/api/create-chat',
  '/api/upload',
  '/api/get-messages',
  '/api/process-file' 
]);


export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:html?|css|js|jpg|jpeg|png|svg|ico|json)).*)',
    '/(api|trpc)(.*)',
  ],
};
