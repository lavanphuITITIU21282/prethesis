import { serveDocument } from '@/app/_server/http-controller.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return serveDocument(request, (await context.params).id);
}
export const HEAD = GET;
