import { NextResponse, type NextRequest } from 'next/server';
import { course } from './modules/content/server.mjs';
import { isStudyPath } from './shared/routing/study-routes';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/api/') && !isStudyPath(path.split('/').filter(Boolean), course)) {
    // Reject unknown app paths before the shared layout starts streaming a 200 response.
    return new NextResponse(
      '<!doctype html><html lang="vi"><meta charset="utf-8"><title>Trạm học · Không tìm thấy trang</title><main><h1>Chưa tìm thấy trang này.</h1><p><a href="/path">Mở lộ trình học</a></p></main></html>',
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      },
    );
  }
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const development = process.env.NODE_ENV === 'development';
  // Nonces allow React bootstrap scripts without permitting arbitrary inline scripts.
  // HTTP LAN access must remain usable, so do not force upgrade-insecure-requests here.
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${development ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  matcher: ['/((?!_next/|assets/|data/|documents/|favicon.ico).*)'],
};
