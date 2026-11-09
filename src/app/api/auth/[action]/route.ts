import { authentication } from '@/app/_server/auth.mjs';
import { createAuthHandler } from '@/app/_server/auth-http.mjs';
const handler = createAuthHandler(authentication);
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ action: string }> };
export async function GET(request: Request, context: Context) {
  return handler(request, (await context.params).action);
}
export const POST = GET;
