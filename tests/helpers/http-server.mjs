import http from 'node:http';
import { Readable } from 'node:stream';
import { createApi, serveDocument } from '../../src/app/_server/http-controller.mjs';

// Adapt Node requests only for tests; production requests are owned by Next Route Handlers.
export function createServer(options) {
  const api = createApi(options);
  return http.createServer(async (incoming, outgoing) => {
    try {
      const request = new Request(`http://${incoming.headers.host}${incoming.url}`, {
        method: incoming.method,
        headers: incoming.headers,
        ...(!['GET', 'HEAD'].includes(incoming.method)
          ? { body: Readable.toWeb(incoming), duplex: 'half' }
          : {}),
      });
      const pathname = new URL(request.url).pathname;
      const response = pathname.startsWith('/api/')
        ? await api(request)
        : pathname.startsWith('/documents/')
          ? await serveDocument(request, pathname.slice('/documents/'.length))
          : new Response(null, { status: 404 });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      if (!response.body) return outgoing.end();
      Readable.fromWeb(response.body).pipe(outgoing);
    } catch {
      outgoing.writeHead(500);
      outgoing.end();
    }
  });
}
